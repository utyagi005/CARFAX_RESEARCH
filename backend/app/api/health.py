from fastapi import APIRouter, Request

router = APIRouter(tags=["health"])


@router.get("/health")
async def health(request: Request) -> dict[str, str]:
    redis = getattr(request.app.state, "redis", None)
    if redis is None:
        return {"service": "autodoc-backend", "status": "degraded"}
    status = "ok"
    try:
        await redis.ping()
    except Exception:
        status = "degraded"
    return {"service": "autodoc-backend", "status": status}
