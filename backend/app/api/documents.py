from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from app.config import get_settings
from app.services import demo_job_service
from app.services import job_service
from app.services.metrics_service import DOCUMENT_UPLOADS
from app.services.storage_service import infer_document_type, save_upload

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", status_code=201)
async def upload_document(request: Request, file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must include a filename.")

    settings = get_settings()
    if settings.autodoc_demo_mode:
        payload = await file.read()
        job = demo_job_service.create_completed_demo_job(
            jobs=request.app.state.demo_jobs,
            results=request.app.state.demo_results,
            filename=file.filename,
            text=payload.decode("utf-8", errors="ignore"),
        )
        DOCUMENT_UPLOADS.inc()
        return job

    saved_path = await save_upload(file)
    document_type = infer_document_type(file.filename)
    job = await job_service.create_job(
        request.app.state.redis,
        filename=file.filename,
        document_type=document_type,
        upload_path=str(saved_path),
    )
    DOCUMENT_UPLOADS.inc()
    return job
