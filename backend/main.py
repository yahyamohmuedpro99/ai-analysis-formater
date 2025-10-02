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
    if len(request.text) > 20000:
        raise HTTPException(status_code=400, detail="Text exceeds maximum length of 20000 characters")

    # Create a new job document
    job_data = {
        "userId": user_id,
        "text": request.text,
        "status": "pending",
        "createdAt": datetime.utcnow()
    }

    # Add job to Firestore
    job_ref = db.collection("jobs").document()
    job_ref.set(job_data)
    job_id = job_ref.id

    # Process the analysis in the background
    background_tasks.add_task(process_analysis, job_id, request.text, user_id)

    # Return job ID immediately
    return {"jobId": job_id}

# Background task to process the analysis
async def process_analysis(job_id: str, text: str, user_id: str):
    print(f"DEBUG: Starting background processing for job {job_id}")
    try:
        # Perform the analysis using OpenAI
        print(f"DEBUG: Calling analyze_text for job {job_id}")
        result = analyze_text(text)
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
