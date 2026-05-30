from fastapi import APIRouter, Request

from app.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health(request: Request) -> dict[str, str]:
    if get_settings().autodoc_demo_mode:
        return {"service": "autodoc-backend", "status": "demo"}

    redis = getattr(request.app.state, "redis", None)
    if redis is None:
        return {"service": "autodoc-backend", "status": "degraded"}
    status = "ok"
    try:
        await redis.ping()
    except Exception:
        status = "degraded"
    return {"service": "autodoc-backend", "status": status}
