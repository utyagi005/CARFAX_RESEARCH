# AI Engineering Roadmap: AutoDoc AI Pipeline

## Thesis

I built AutoDoc AI Pipeline to move beyond an AI wrapper and think like an LLM platform engineer. The core question was: if vehicle document extraction were a real AI workload, how would I queue it, retry it, observe it, scale it, secure it, and explain it in an interview?

## Two-Day Build Strategy

Day 1 focused on a working local slice: React upload UI, FastAPI job creation, Redis queueing, and a Python worker that turns uploaded vehicle documents into normalized JSON.

Day 2 focused on platform polish: validation and anomaly checks, Prompt Lab experiments, observability metrics, Grafana/Prometheus config, Kubernetes manifests, CI/CD, security notes, and runbook documentation.

## Engineering Decisions

- Mock-first extraction keeps the project free and demoable without paid API keys.
- Redis separates the API path from extraction work so the UI remains responsive under load.
- Jobs are visible through status transitions: `queued`, `processing`, `completed`, `retrying`, and `dead_letter`.
- Metrics and structured logs focus on metadata, not document contents, because uploaded documents may contain sensitive information.
- Kubernetes files are included as deployment design artifacts, while Docker Compose remains the local execution path.

## Evidence Plan

- Add screenshots for upload, job status, extraction review, and observability pages under `assets/`.
- Capture a short demo GIF showing upload to completed extraction.
- Keep sample fixture documents under `worker/fixtures/` so recruiters can reproduce the workflow.
- Use CI badges once GitHub Actions has run on the public repository.

## Interview Framing

This project helped me practice AI engineering as systems engineering. The extraction result matters, but the platform around it matters just as much: queues, workers, retries, metrics, deployment manifests, CI, and security boundaries are what make AI workloads operable.

