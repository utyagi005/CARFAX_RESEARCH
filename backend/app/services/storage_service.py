from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.config import get_settings


def infer_document_type(filename: str) -> str:
    normalized = filename.lower()
    if "invoice" in normalized or "repair" in normalized:
        return "repair_invoice"
    if "inspection" in normalized:
        return "inspection_report"
    if "accident" in normalized or "claim" in normalized:
        return "accident_summary"
    if "recall" in normalized:
        return "recall_notice"
    return "vehicle_document"


async def save_upload(upload: UploadFile) -> Path:
    settings = get_settings()
    safe_name = Path(upload.filename or "document.txt").name.replace(" ", "_")
    destination = settings.upload_dir / f"{uuid4().hex}_{safe_name}"
    content = await upload.read()
    destination.write_bytes(content)
    return destination

