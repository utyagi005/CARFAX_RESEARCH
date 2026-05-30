import json

from fastapi import APIRouter, HTTPException, Request

from app.config import get_settings
from app.services import job_service

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("")
async def list_jobs(request: Request):
    return await job_service.list_jobs(request.app.state.redis)


@router.get("/{job_id}")
async def get_job(request: Request, job_id: str):
    job = await job_service.get_job(request.app.state.redis, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    return job


@router.get("/{job_id}/result")
async def get_job_result(request: Request, job_id: str):
    job = await job_service.get_job(request.app.state.redis, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    if not job.result_path:
        raise HTTPException(status_code=404, detail="Result is not available yet.")

    result_path = get_settings().results_dir / job.result_path
    if not result_path.exists():
        raise HTTPException(status_code=404, detail="Result file is missing.")
    return json.loads(result_path.read_text())

