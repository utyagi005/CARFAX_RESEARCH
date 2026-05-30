# Verification

This project was verified locally with unit tests, linting, frontend build checks, Docker Compose, and a real upload-to-worker flow.

## Automated Checks

```bash
PYTHONPATH=backend pytest backend/tests -q
PYTHONPATH=worker pytest worker/tests -q
ruff check backend/app backend/tests worker
cd frontend && npm run build
```

## Container Smoke Test

```bash
docker compose up --build -d
curl http://127.0.0.1:8000/health
curl -F "file=@worker/fixtures/honda_accord_repair_invoice.txt" \
  http://127.0.0.1:8000/documents/upload
curl http://127.0.0.1:8000/observability/summary
```

Observed result:

- Redis became healthy.
- Backend, frontend, and worker containers started.
- Upload created a queued job.
- Worker processed the job with one attempt.
- Job transitioned to `completed`.
- Result JSON included VIN `1HGCM82633A004352`, odometer `84250`, service date `2026-05-20`, and no validation/anomaly flags.
- Observability summary reported one processed document, one successful extraction, queue depth zero, worker health `ok`, and backend health `ok`.

