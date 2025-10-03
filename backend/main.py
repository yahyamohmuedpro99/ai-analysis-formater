import uvicorn
from fastapi import FastAPI, BackgroundTasks, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from datetime import datetime
from models import TextAnalysisRequest, JobDocument, TextAnalysisResponse
from firebase_admin_config import db
from openai_service import analyze_text
from auth import verify_firebase_token
import os
import firebase_admin.firestore as firestore
import feedparser
import random
from bs4 import BeautifulSoup
import httpx

app = FastAPI(title="AI Text Analysis API", version="1.0.0")

# Add CORS middleware to allow requests from the frontend
print("DEBUG: Setting up CORS middleware", os.getenv('FRONTEND_URL'))
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv('FRONTEND_URL'),'https://kai-developer-test.web.app','localhost:3000','http://localhost:3000'],  
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],  
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Handle CORS preflight requests
@app.options("/api/{path:path}")
async def preflight_handler(path: str):
    return {"message": "OK"}

# Protected endpoint to analyze text
@app.post("/api/analyze")
async def analyze_text_endpoint(
    request: TextAnalysisRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(verify_firebase_token)
):
    print(f"DEBUG: Received analysis request from user: {user_id}")
    print(f"DEBUG: Text length: {len(request.text)}")
    # Validate text length
    if len(request.text) > 100000:
        raise HTTPException(status_code=400, detail="Text exceeds maximum length of 100000 characters")

    # Create a new job document
    job_data = {
        "userId": user_id,
        "text": request.text,
        "mode": request.mode,
        "status": "pending",
        "createdAt": datetime.utcnow()
    }

    # Add job to Firestore
    job_ref = db.collection("jobs").document()
    job_ref.set(job_data)
    job_id = job_ref.id

    # Process the analysis in the background
    background_tasks.add_task(process_analysis, job_id, request.text, user_id, request.mode)

    # Return job ID immediately
    return {"jobId": job_id}

# Background task to process the analysis
async def process_analysis(job_id: str, text: str, user_id: str, mode: str = "simple"):
    print(f"DEBUG: Starting background processing for job {job_id} in {mode} mode")
    try:
        # Perform the analysis using OpenAI
        print(f"DEBUG: Calling analyze_text for job {job_id}")
        result = analyze_text(text, mode)
        print(f"DEBUG: Got result for job {job_id}: {result}")

        # Update job with results
        job_ref = db.collection("jobs").document(job_id)
        update_data = {
            "status": "completed",
            "completedAt": datetime.utcnow(),
            "result": result.dict()
        }
        print(f"DEBUG: Updating job {job_id} with: {update_data}")
        job_ref.update(update_data)
        print(f"DEBUG: Successfully completed job {job_id}")
    except Exception as e:
        print(f"DEBUG: Error processing job {job_id}: {str(e)}")
        # Update job with error status
        try:
            job_ref = db.collection("jobs").document(job_id)
            job_ref.update({
                "status": "failed",
                "completedAt": datetime.utcnow(),
                "error": str(e)
            })
            print(f"DEBUG: Marked job {job_id} as failed")
        except Exception as update_error:
            print(f"DEBUG: Failed to update job {job_id} status: {str(update_error)}")

# Protected endpoint to get all user's jobs
@app.get("/api/jobs/{user_id}")
async def get_user_jobs(
    user_id: str,
    current_user_id: str = Depends(verify_firebase_token),
    page: int = 1,
    limit: int = 5,
    search: str = ""
):
    try:
        print(f"DEBUG: Getting jobs for user {user_id}, page {page}, limit {limit}")

        # Verify that the user is requesting their own jobs
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")

        # Query Firestore for user's jobs with proper pagination
        jobs_query = db.collection("jobs").where(filter=firestore.FieldFilter("userId", "==", user_id))

        # For search queries, we need to fetch all and filter (simplified approach)
        if search:
            print(f"DEBUG: Search query: {search}")
            # Fetch all jobs for search (inefficient but works for now)
            all_jobs_docs = jobs_query.order_by("createdAt", direction="DESCENDING").stream()
            jobs = []
            for doc in all_jobs_docs:
                job_data = doc.to_dict()
                if search.lower() in job_data["text"].lower():
                    job_data["id"] = doc.id
                    jobs.append(job_data)

            # Apply pagination to filtered results
            total = len(jobs)
            start_index = (page - 1) * limit
            end_index = start_index + limit
            paginated_jobs = jobs[start_index:end_index]
        else:
            # No search - use simple approach for now (fetch all and paginate in memory)
            print(f"DEBUG: Fetching all jobs for pagination")
            all_jobs_docs = jobs_query.stream()

            jobs = []
            for doc in all_jobs_docs:
                job_data = doc.to_dict()
                job_data["id"] = doc.id
                jobs.append(job_data)

            # Sort jobs by createdAt in descending order
            jobs.sort(key=lambda x: x.get("createdAt", ""), reverse=True)

            # Apply pagination
            total = len(jobs)
            start_index = (page - 1) * limit
            end_index = start_index + limit
            paginated_jobs = jobs[start_index:end_index]

        print(f"DEBUG: Returning {len(paginated_jobs)} jobs, total estimated: {total}")
        return {"jobs": paginated_jobs, "total": total}

    except Exception as e:
        print(f"DEBUG: Error in get_user_jobs: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Protected endpoint to get a single job
@app.get("/api/job/{job_id}")
async def get_single_job(
    job_id: str,
    current_user_id: str = Depends(verify_firebase_token)
):
    # Get the job to verify ownership
    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    job_data = job_doc.to_dict()

    # Verify that the user owns this job
    if job_data["userId"] != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    job_data["id"] = job_id
    return job_data

# Protected endpoint to delete a job
@app.delete("/api/jobs/{job_id}")
async def delete_job(
    job_id: str,
    current_user_id: str = Depends(verify_firebase_token)
):
    # Get the job to verify ownership
    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    job_data = job_doc.to_dict()

    # Verify that the user owns this job
    if job_data["userId"] != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Delete the job
    job_ref.delete()

    return {"message": "Job deleted successfully"}

# Public endpoint to get random article from RSS feed
@app.get("/api/rss/random-article")
async def get_random_rss_article():
    """Fetch a random article from Paul Graham's essay RSS feed and scrape the full content"""
    rss_url = "http://www.aaronsw.com/2002/feeds/pgessays.rss"

    try:
        # Parse the RSS feed
        feed = feedparser.parse(rss_url)

        if not feed.entries:
            raise HTTPException(status_code=404, detail="No articles found in RSS feed")

        # Get a random entry
        random_entry = random.choice(feed.entries)
        article_url = random_entry.get('link', '')

        if not article_url:
            raise HTTPException(status_code=404, detail="Article link not found")

        # Fetch the full article content from the link
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(article_url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })

            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch article")

            # Parse HTML content
            soup = BeautifulSoup(response.text, 'html.parser')

            # Remove script and style elements
            for script in soup(["script", "style", "nav", "header", "footer", "aside"]):
                script.decompose()

            # Get text content
            text = soup.get_text()

            # Clean up text
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text_content = '\n'.join(chunk for chunk in chunks if chunk)

            # Limit to 100k characters
            if len(text_content) > 100000:
                text_content = text_content[:100000]

        return {
            "title": random_entry.get('title', 'No title'),
            "link": article_url,
            "text": text_content.strip(),
            "published": random_entry.get('published', '')
        }

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timed out while fetching the article")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Error fetching article: {str(e)}")
    except Exception as e:
        print(f"Error fetching RSS article: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch RSS article: {str(e)}")

# Public endpoint to scrape text from a URL
@app.get("/api/scrape")
async def scrape_url(url: str):
    """Scrape text content from a given URL"""

    if not url or not url.startswith(('http://', 'https://')):
        raise HTTPException(status_code=400, detail="Invalid URL provided")

    try:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            })

            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch URL: HTTP {response.status_code}")

            # Parse HTML content
            soup = BeautifulSoup(response.text, 'html.parser')

            # Remove script and style elements
            for script in soup(["script", "style", "nav", "header", "footer", "aside"]):
                script.decompose()

            # Get text content
            text = soup.get_text()

            # Clean up text
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = '\n'.join(chunk for chunk in chunks if chunk)

            # Limit to 100k characters
            if len(text) > 100000:
                text = text[:100000]

            if not text or len(text.strip()) < 50:
                raise HTTPException(status_code=422, detail="Could not extract meaningful text from the URL")

            return {
                "text": text.strip(),
                "url": url,
                "length": len(text.strip())
            }

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Request timed out while fetching the URL")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Error fetching URL: {str(e)}")
    except Exception as e:
        print(f"Error scraping URL: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to scrape URL. The website may be blocking automated access or the content may not be accessible.")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
