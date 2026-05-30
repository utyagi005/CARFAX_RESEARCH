from datetime import UTC, datetime
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"
    DEAD_LETTER = "dead_letter"


class JobRecord(BaseModel):
    job_id: str
    filename: str
    document_type: str = "unknown"
    status: JobStatus = JobStatus.QUEUED
    attempts: int = 0
    upload_path: str | None = None
    result_path: str | None = None
    latency_ms: int | None = None
    confidence_score: float | None = None
    validation_errors: list[str] = Field(default_factory=list)
    anomaly_flags: list[str] = Field(default_factory=list)
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def create(
        cls,
        *,
        filename: str,
        document_type: str = "unknown",
        upload_path: str | None = None,
    ) -> "JobRecord":
        now = datetime.now(UTC)
        return cls(
            job_id=f"job_{uuid4().hex[:12]}",
            filename=filename,
            document_type=document_type,
            upload_path=upload_path,
            created_at=now,
            updated_at=now,
        )

    def with_updates(self, **updates: Any) -> "JobRecord":
        return self.model_copy(update={**updates, "updated_at": datetime.now(UTC)})

