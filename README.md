# AutoDoc AI Pipeline

AutoDoc AI Pipeline is a recruiter-ready LLM platform engineering simulation for vehicle document intelligence. It runs a local multi-service AI workload with a React dashboard, FastAPI backend, Redis queue, and Python extraction worker.

## Why This Exists

The goal is to show platform thinking around AI workloads: queueing, retries, worker isolation, validation, observability, deployment manifests, CI/CD, and safe operations. The project starts mock-first so it is free to run without paid API keys, while leaving a clean path for future OpenAI or Gemini-backed extraction.

## Local Quick Start

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/health
- Prometheus metrics: http://localhost:8000/metrics
- Worker metrics: http://localhost:9100/metrics

## Current Flow

```text
Upload vehicle document
  -> FastAPI saves file and creates job
  -> Redis queues the job
  -> Python worker processes the job
  -> Mock extraction result is written as JSON
  -> React dashboard shows status and review data
```

## Tech Stack

- React, TypeScript, Vite, Tailwind CSS
- FastAPI, Pydantic, Uvicorn
- Redis queue and job store
- Python worker service
- Prometheus-compatible metrics
- Docker Compose

## Demo Data

Text-like files are best for the local demo. Try a `.txt` file containing:

```text
VIN 1HGCM82633A004352
Odometer 84250
Brake inspection completed for Honda Accord.
```
