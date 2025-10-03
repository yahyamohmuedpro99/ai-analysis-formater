from fastapi import APIRouter, Depends, HTTPException
import firebase_admin.firestore as firestore
from ..firebase_admin_config import db
from ..auth import verify_firebase_token

router = APIRouter(prefix="/api", tags=["jobs"])


@router.get("/jobs/{user_id}")
async def get_user_jobs(
    user_id: str,
    current_user_id: str = Depends(verify_firebase_token),
    page: int = 1,
    limit: int = 5,
    search: str = ""
):
    try:
        if user_id != current_user_id:
            raise HTTPException(status_code=403, detail="Access denied")

        jobs_query = db.collection("jobs").where(filter=firestore.FieldFilter("userId", "==", user_id))

        if search:
            all_jobs_docs = jobs_query.order_by("createdAt", direction="DESCENDING").stream()
            jobs = []
            for doc in all_jobs_docs:
                job_data = doc.to_dict()
                if search.lower() in job_data["text"].lower():
                    job_data["id"] = doc.id
                    jobs.append(job_data)

            total = len(jobs)
            start_index = (page - 1) * limit
            end_index = start_index + limit
            paginated_jobs = jobs[start_index:end_index]
        else:
            all_jobs_docs = jobs_query.stream()
            jobs = []
            for doc in all_jobs_docs:
                job_data = doc.to_dict()
                job_data["id"] = doc.id
                jobs.append(job_data)

            jobs.sort(key=lambda x: x.get("createdAt", ""), reverse=True)

            total = len(jobs)
            start_index = (page - 1) * limit
            end_index = start_index + limit
            paginated_jobs = jobs[start_index:end_index]

        return {"jobs": paginated_jobs, "total": total}

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/job/{job_id}")
async def get_single_job(
    job_id: str,
    current_user_id: str = Depends(verify_firebase_token)
):
    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    job_data = job_doc.to_dict()

    if job_data["userId"] != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    job_data["id"] = job_id
    return job_data


@router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: str,
    current_user_id: str = Depends(verify_firebase_token)
):
    job_ref = db.collection("jobs").document(job_id)
    job_doc = job_ref.get()

    if not job_doc.exists:
        raise HTTPException(status_code=404, detail="Job not found")

    job_data = job_doc.to_dict()

    if job_data["userId"] != current_user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    job_ref.delete()

    return {"message": "Job deleted successfully"}
