from pydantic import BaseModel, Field
from fastapi import APIRouter

from app.services.extraction_service import run_mock_extraction

router = APIRouter(prefix="/prompt-lab", tags=["prompt-lab"])


class PromptLabRequest(BaseModel):
    filename: str = Field(default="sample_vehicle_document.txt")
    text: str


@router.post("/run")
async def run_prompt_lab(payload: PromptLabRequest):
    return run_mock_extraction(filename=payload.filename, text=payload.text)

