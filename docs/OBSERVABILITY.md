# Observability

AutoDoc exposes Prometheus-compatible metrics from the backend and worker.

## Metrics

- `autodoc_backend_requests_total`
- `autodoc_backend_request_latency_seconds`
- `autodoc_document_uploads_total`
- `autodoc_queue_depth`
- `autodoc_documents_processed_total`
- `autodoc_extractions_success_total`
- `autodoc_extractions_failed_total`
- `autodoc_jobs_retry_total`
- `autodoc_worker_queue_depth`
- `autodoc_extraction_latency_seconds`

## Local Endpoints

- Backend metrics: `http://localhost:8000/metrics`
- Worker metrics: `http://localhost:9100/metrics`
- Frontend summary: `http://localhost:8000/observability/summary`

## Production Upgrade Path

Prometheus can scrape service endpoints directly. Loki could collect structured JSON logs, Tempo could trace upload-to-result paths, and Mimir could retain metrics for longer-term trend analysis.

