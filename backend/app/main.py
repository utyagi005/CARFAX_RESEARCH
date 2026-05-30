import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from app.api import documents, health, jobs, observability, prompt_lab
from app.config import get_settings
from app.services.metrics_service import QUEUE_DEPTH, REQUEST_COUNT, REQUEST_LATENCY
from app.services.redis_client import create_redis


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = await create_redis()
    yield
    await app.state.redis.aclose()


app = FastAPI(
    title="AutoDoc AI Pipeline API",
    description="FastAPI service for vehicle document job orchestration.",
    version="0.1.0",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def collect_request_metrics(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    path = request.url.path
    REQUEST_COUNT.labels(request.method, path, str(response.status_code)).inc()
    REQUEST_LATENCY.labels(request.method, path).observe(time.perf_counter() - start)
    if hasattr(request.app.state, "redis"):
        try:
            QUEUE_DEPTH.set(await request.app.state.redis.llen(settings.queue_name))
        except Exception:
            pass
    return response


@app.get("/metrics", include_in_schema=False)
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


app.include_router(health.router)
app.include_router(documents.router)
app.include_router(jobs.router)
app.include_router(prompt_lab.router)
app.include_router(observability.router)

