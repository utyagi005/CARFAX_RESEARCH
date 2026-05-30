import json
import os
import time
from datetime import UTC, datetime
from pathlib import Path

import redis
import structlog
from prometheus_client import Counter, Gauge, Histogram, start_http_server

from extraction import run_mock_extraction

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
QUEUE_NAME = os.getenv("QUEUE_NAME", "autodoc:queue")
DEAD_LETTER_QUEUE_NAME = os.getenv("DEAD_LETTER_QUEUE_NAME", "autodoc:dlq")
RESULTS_DIR = Path(os.getenv("RESULTS_DIR", "./volumes/results"))
MAX_ATTEMPTS = int(os.getenv("MAX_ATTEMPTS", "3"))
METRICS_PORT = int(os.getenv("WORKER_METRICS_PORT", "9100"))

DOCUMENTS_PROCESSED = Counter(
    "autodoc_documents_processed_total",
    "Total documents processed by workers.",
)
EXTRACTIONS_SUCCESS = Counter(
    "autodoc_extractions_success_total",
    "Successful mock extractions.",
)
EXTRACTIONS_FAILED = Counter(
    "autodoc_extractions_failed_total",
    "Failed mock extractions.",
)
JOBS_RETRY = Counter("autodoc_jobs_retry_total", "Retried extraction jobs.")
QUEUE_DEPTH = Gauge("autodoc_worker_queue_depth", "Worker-observed Redis queue depth.")
EXTRACTION_LATENCY = Histogram(
    "autodoc_extraction_latency_seconds",
    "Worker extraction latency in seconds.",
)

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)
logger = structlog.get_logger()


def job_key(job_id: str) -> str:
    return f"job:{job_id}"


def load_job(client: redis.Redis, job_id: str) -> dict:
    payload = client.get(job_key(job_id))
    if not payload:
        raise RuntimeError(f"job {job_id} not found")
    return json.loads(payload)


def save_job(client: redis.Redis, job: dict) -> None:
    job["updated_at"] = datetime.now(UTC).isoformat()
    client.set(job_key(job["job_id"]), json.dumps(job))


def process_message(client: redis.Redis, payload: str) -> None:
    message = json.loads(payload)
    job = load_job(client, message["job_id"])
    started = time.perf_counter()
    attempts = int(job.get("attempts", 0)) + 1
    job.update({"status": "processing", "attempts": attempts})
    save_job(client, job)
    logger.info("job_started", job_id=job["job_id"], filename=job["filename"], attempts=attempts)

    try:
        upload_path = Path(job["upload_path"])
        text = upload_path.read_text(errors="ignore") if upload_path.exists() else ""
        result = run_mock_extraction(filename=job["filename"], text=text)
        RESULTS_DIR.mkdir(parents=True, exist_ok=True)
        result_filename = f"{job['job_id']}.json"
        (RESULTS_DIR / result_filename).write_text(json.dumps(result, indent=2))
        latency_ms = int((time.perf_counter() - started) * 1000)
        job.update(
            {
                "status": "completed",
                "result_path": result_filename,
                "latency_ms": latency_ms,
                "confidence_score": result["confidence_score"],
                "validation_errors": result.get("validation_errors", []),
                "anomaly_flags": result.get("anomaly_flags", []),
                "error_message": None,
            }
        )
        save_job(client, job)
        DOCUMENTS_PROCESSED.inc()
        EXTRACTIONS_SUCCESS.inc()
        EXTRACTION_LATENCY.observe(latency_ms / 1000)
        logger.info("job_completed", job_id=job["job_id"], latency_ms=latency_ms)
    except Exception as exc:
        if attempts < MAX_ATTEMPTS:
            job.update({"status": "retrying", "error_message": str(exc)})
            save_job(client, job)
            client.rpush(QUEUE_NAME, payload)
            JOBS_RETRY.inc()
            logger.warning("job_retrying", job_id=job["job_id"], error=str(exc), attempts=attempts)
            return
        job.update({"status": "dead_letter", "error_message": str(exc)})
        save_job(client, job)
        client.rpush(DEAD_LETTER_QUEUE_NAME, payload)
        EXTRACTIONS_FAILED.inc()
        logger.error("job_dead_lettered", job_id=job["job_id"], error=str(exc), attempts=attempts)


def main() -> None:
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    start_http_server(METRICS_PORT)
    client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
    logger.info("worker_started", queue=QUEUE_NAME, redis_url=REDIS_URL, metrics_port=METRICS_PORT)
    while True:
        QUEUE_DEPTH.set(client.llen(QUEUE_NAME))
        item = client.blpop(QUEUE_NAME, timeout=5)
        if not item:
            continue
        _, payload = item
        process_message(client, payload)


if __name__ == "__main__":
    main()
