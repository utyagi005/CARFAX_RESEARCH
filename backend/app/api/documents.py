from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from app.services import job_service
from app.services.metrics_service import DOCUMENT_UPLOADS
from app.services.storage_service import infer_document_type, save_upload

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", status_code=201)
async def upload_document(request: Request, file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file must include a filename.")

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

