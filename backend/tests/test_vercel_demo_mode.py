from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app


def test_demo_mode_uploads_without_redis(monkeypatch):
    monkeypatch.setenv("AUTODOC_DEMO_MODE", "true")
    get_settings.cache_clear()

    with TestClient(app) as client:
        health = client.get("/health")
        upload = client.post(
            "/documents/upload",
            files={
                "file": (
                    "honda_accord_repair_invoice.txt",
                    b"VIN 1HGCM82633A004352 odometer 84250 brake inspection 2026-04-11",
                )
            },
        )
        job = upload.json()
        result = client.get(f"/jobs/{job['job_id']}/result")
        summary = client.get("/observability/summary")

    monkeypatch.delenv("AUTODOC_DEMO_MODE")
    get_settings.cache_clear()

    assert health.json()["status"] == "demo"
    assert upload.status_code == 201
    assert job["status"] == "completed"
    assert result.json()["vin"] == "1HGCM82633A004352"
    assert summary.json()["worker_health"] == "simulated"
