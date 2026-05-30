import json

from fastapi import APIRouter, Request

from app.config import get_settings
from app.models.job import JobStatus
from app.services.job_service import list_jobs

router = APIRouter(prefix="/observability", tags=["observability"])


@router.get("/summary")
async def observability_summary(request: Request):
    settings = get_settings()
    redis = request.app.state.redis
    jobs = await list_jobs(redis, limit=500)
    queue_depth = await redis.llen(settings.queue_name)
    summary_payload = await redis.get(settings.metrics_summary_key)
    worker_summary = json.loads(summary_payload) if summary_payload else {}

    completed = [job for job in jobs if job.status == JobStatus.COMPLETED]
    failed = [job for job in jobs if job.status in {JobStatus.FAILED, JobStatus.DEAD_LETTER}]
    retries = sum(job.attempts - 1 for job in jobs if job.attempts > 1)
    latencies = [job.latency_ms for job in completed if job.latency_ms is not None]
    anomaly_count = sum(len(job.anomaly_flags) for job in jobs)
    validation_failure_count = sum(len(job.validation_errors) for job in jobs)

    return {
        "documents_processed": len(jobs),
        "successful_extractions": len(completed),
        "failed_extractions": len(failed),
        "retry_count": retries,
        "queue_depth": queue_depth,
        "worker_throughput": worker_summary.get("worker_throughput", len(completed)),
        "average_latency_ms": int(sum(latencies) / len(latencies)) if latencies else worker_summary.get("average_latency_ms", 0),
        "p95_latency_ms": worker_summary.get("p95_latency_ms", max(latencies) if latencies else 0),
        "validation_failure_count": validation_failure_count,
        "anomaly_count": anomaly_count,
        "backend_health": "ok",
        "worker_health": worker_summary.get("worker_health", "unknown"),
        "timeline": worker_summary.get(
            "timeline",
            [
                {"label": "queued", "value": queue_depth},
                {"label": "completed", "value": len(completed)},
                {"label": "failed", "value": len(failed)},
            ],
        ),
    }

