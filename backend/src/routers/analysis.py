from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from datetime import datetime
from ..models import TextAnalysisRequest
from ..firebase_admin_config import db
from ..openai_service import analyze_text
from ..auth import verify_firebase_token

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/analyze")
async def analyze_text_endpoint(
    request: TextAnalysisRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(verify_firebase_token)
):
    print(f"DEBUG: Received analysis request from user: {user_id}")
    print(f"DEBUG: Text length: {len(request.text)}")
    
    if len(request.text) > 100000:
        raise HTTPException(status_code=400, detail="Text exceeds maximum length of 100000 characters")

    job_data = {
        "userId": user_id,
        "text": request.text,
        "mode": request.mode,
        "status": "pending",
        "createdAt": datetime.utcnow()
    }

    job_ref = db.collection("jobs").document()
    job_ref.set(job_data)
    job_id = job_ref.id

    background_tasks.add_task(process_analysis, job_id, request.text, user_id, request.mode)

    return {"jobId": job_id}


async def process_analysis(job_id: str, text: str, user_id: str, mode: str = "simple"):
    print(f"DEBUG: Starting background processing for job {job_id} in {mode} mode")
    try:
        result = analyze_text(text, mode)
        
        job_ref = db.collection("jobs").document(job_id)
        update_data = {
            "status": "completed",
            "completedAt": datetime.utcnow(),
            "result": result.dict()
        }
        job_ref.update(update_data)
        print(f"DEBUG: Successfully completed job {job_id}")
    except Exception as e:
        print(f"DEBUG: Error processing job {job_id}: {str(e)}")
        try:
            job_ref = db.collection("jobs").document(job_id)
            job_ref.update({
                "status": "failed",
                "completedAt": datetime.utcnow(),
                "error": str(e)
            })
        except Exception as update_error:
            print(f"DEBUG: Failed to update job {job_id} status: {str(update_error)}")
