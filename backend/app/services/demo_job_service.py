import time

from app.models.job import JobRecord, JobStatus
from app.services.extraction_service import run_mock_extraction
from app.services.storage_service import infer_document_type


def create_completed_demo_job(
    *,
    jobs: dict[str, JobRecord],
    results: dict[str, dict],
    filename: str,
    text: str,
) -> JobRecord:
    start = time.perf_counter()
    result = run_mock_extraction(filename=filename, text=text)
    job = JobRecord.create(
        filename=filename,
        document_type=infer_document_type(filename),
        upload_path=f"vercel-demo://{filename}",
    ).with_updates(
        status=JobStatus.COMPLETED,
        attempts=1,
        result_path=f"{filename}.json",
        latency_ms=int((time.perf_counter() - start) * 1000) or 1,
        confidence_score=result["confidence_score"],
        validation_errors=result["validation_errors"],
        anomaly_flags=result["anomaly_flags"],
    )
    jobs[job.job_id] = job
    results[job.job_id] = result
    return job


def list_demo_jobs(jobs: dict[str, JobRecord]) -> list[JobRecord]:
    return sorted(jobs.values(), key=lambda job: job.created_at, reverse=True)
