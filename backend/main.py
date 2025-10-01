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

app = FastAPI(title="AI Text Analysis API", version="1.0.0")

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",  # Alternative dev port
        "http://127.0.0.1:3000",  # Alternative localhost
        "http://127.0.0.1:3001",
        "http://localhost:3000",  # Explicit for HTTPS if needed
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "authorization",
        "content-type",
        "accept",
        "origin",
        "user-agent",
        "accept-encoding",
        "accept-language"
    ],
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
    try:
        # Perform the analysis using OpenAI
        result = analyze_text(text)
        
        # Update job with results
        job_ref = db.collection("jobs").document(job_id)
        job_ref.update({
            "status": "completed",
            "completedAt": datetime.utcnow(),
            "result": result.dict()
        })
    except Exception as e:
        # Update job with error status
        job_ref = db.collection("jobs").document(job_id)
        job_ref.update({
            "status": "failed",
            "completedAt": datetime.utcnow()
        })
        print(f"Error processing job {job_id}: {str(e)}")

# Protected endpoint to get all user's jobs
@app.get("/api/jobs/{user_id}")
async def get_user_jobs(
    user_id: str,
    current_user_id: str = Depends(verify_firebase_token),
    page: int = 1,
    limit: int = 10,
    search: str = ""
):
    # Verify that the user is requesting their own jobs
    if user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Query Firestore for user's jobs
    jobs_query = db.collection("jobs").where("userId", "==", user_id)
    
    # If search term is provided, filter jobs
    if search:
        # Note: This is a simplified search implementation
        # In production, you might want to use Firestore's full-text search capabilities
        pass  # Search implementation would go here
    
    # Get all jobs first (we'll implement proper pagination later)
    jobs_docs = jobs_query.stream()

    jobs = []
    for doc in jobs_docs:
        job_data = doc.to_dict()
        job_data["id"] = doc.id
        
        # Apply search filter if provided
        if search and search.lower() not in job_data["text"].lower():
            continue
            
        jobs.append(job_data)

    # Sort jobs by createdAt in descending order
    jobs.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    # Implement pagination
    total = len(jobs)
    start_index = (page - 1) * limit
    end_index = start_index + limit
    paginated_jobs = jobs[start_index:end_index]
    
    return {"jobs": paginated_jobs, "total": total}

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
