# AutoDoc AI Pipeline Project Brief

AutoDoc AI Pipeline is a vehicle document intelligence platform built to demonstrate LLM platform engineering fundamentals. It processes uploaded vehicle documents through a queue-backed worker flow, produces normalized mock extraction JSON, validates fields, flags anomalies, and exposes operational metrics.

The project is intentionally mock-first. That keeps the demo free to run while still showing how a paid LLM provider could be introduced behind a clean extraction boundary later.

## What It Demonstrates

- AI workload orchestration with API, queue, worker, storage, and dashboard services.
- Reliability patterns: retries, dead-letter queue, status lifecycle, and safe metadata logging.
- Platform observability: Prometheus metrics, Grafana dashboard config, and frontend summary cards.
- Deployment mindset: Docker Compose locally, Kubernetes manifests, HPA example, CI/CD, and security notes.

