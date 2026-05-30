# Runbook

## Worker Is Not Processing Jobs

Check Redis connectivity, worker container status, queue depth, worker logs, and environment variables. Confirm the worker has the same `REDIS_URL` and queue name as the backend.

## Queue Depth Is Growing

Check worker replicas, failed jobs, extraction latency, backend enqueue rate, and CPU/memory usage. In Kubernetes, increase worker replicas or use KEDA/custom metrics for queue-depth scaling.

## Extractions Are Failing

Check mock extractor errors, validation rules, file format, retry count, and dead-letter queue entries. Use fixture documents first to isolate parsing problems from upload issues.

## Dashboard Metrics Are Missing

Check `/metrics`, `/observability/summary`, Prometheus scrape config, service names, and container networking.

## Deployment Fails

Check Docker build logs, Kubernetes YAML syntax, missing secrets, image names, service ports, and namespace creation order.

