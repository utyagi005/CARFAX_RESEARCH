import json
from datetime import UTC, datetime
from typing import Any

from redis.asyncio import Redis

from app.config import get_settings
from app.models.job import JobRecord, JobStatus


def _job_key(job_id: str) -> str:
    return f"job:{job_id}"


def _serialize(job: JobRecord) -> str:
    return job.model_dump_json()


def _deserialize(payload: str) -> JobRecord:
    return JobRecord.model_validate_json(payload)


async def create_job(
    redis: Redis,
    *,
    filename: str,
    document_type: str,
    upload_path: str,
) -> JobRecord:
    settings = get_settings()
    job = JobRecord.create(
        filename=filename,
        document_type=document_type,
        upload_path=upload_path,
    )
    async with redis.pipeline(transaction=True) as pipe:
        pipe.set(_job_key(job.job_id), _serialize(job))
        pipe.lpush(settings.jobs_index_key, job.job_id)
        pipe.rpush(
            settings.queue_name,
            json.dumps(
                {
                    "job_id": job.job_id,
                    "filename": filename,
                    "upload_path": upload_path,
                    "queued_at": datetime.now(UTC).isoformat(),
                }
            ),
        )
        await pipe.execute()
    return job


async def get_job(redis: Redis, job_id: str) -> JobRecord | None:
    payload = await redis.get(_job_key(job_id))
    return _deserialize(payload) if payload else None


async def list_jobs(redis: Redis, *, limit: int = 100) -> list[JobRecord]:
    settings = get_settings()
    job_ids = await redis.lrange(settings.jobs_index_key, 0, limit - 1)
    if not job_ids:
        return []
    payloads = await redis.mget([_job_key(job_id) for job_id in job_ids])
    jobs = [_deserialize(payload) for payload in payloads if payload]
    return sorted(jobs, key=lambda job: job.created_at, reverse=True)


async def update_job(redis: Redis, job_id: str, **updates: Any) -> JobRecord | None:
    existing = await get_job(redis, job_id)
    if existing is None:
        return None
    if "status" in updates and not isinstance(updates["status"], JobStatus):
        updates["status"] = JobStatus(updates["status"])
    updated = existing.with_updates(**updates)
    await redis.set(_job_key(job_id), _serialize(updated))
    return updated

