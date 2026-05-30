import json

from fastapi.testclient import TestClient

from app.main import app


class FakeRedis:
    async def llen(self, key: str) -> int:
        return 2

    async def lrange(self, key: str, start: int, end: int) -> list[str]:
        return ["job_done", "job_failed"]

    async def mget(self, keys: list[str]) -> list[str]:
        return [
            json.dumps(
                {
                    "job_id": "job_done",
                    "filename": "invoice.txt",
                    "document_type": "repair_invoice",
                    "status": "completed",
                    "attempts": 1,
                    "confidence_score": 0.91,
                    "validation_errors": [],
                    "anomaly_flags": [],
                    "created_at": "2026-05-30T10:00:00Z",
                    "updated_at": "2026-05-30T10:00:03Z",
                }
            ),
            json.dumps(
                {
                    "job_id": "job_failed",
                    "filename": "bad.txt",
                    "document_type": "vehicle_document",
                    "status": "dead_letter",
                    "attempts": 3,
                    "validation_errors": ["VIN must be 17 characters."],
                    "anomaly_flags": ["missing_vin"],
                    "created_at": "2026-05-30T10:01:00Z",
                    "updated_at": "2026-05-30T10:01:08Z",
                }
            ),
        ]

    async def get(self, key: str) -> str | None:
        if key == "autodoc:metrics:summary":
            return json.dumps({"worker_throughput": 4, "average_latency_ms": 1200})
        return None


def test_observability_summary_aggregates_jobs():
    app.state.redis = FakeRedis()
    client = TestClient(app)

    response = client.get("/observability/summary")

    assert response.status_code == 200
    payload = response.json()
    assert payload["documents_processed"] == 2
    assert payload["successful_extractions"] == 1
    assert payload["failed_extractions"] == 1
    assert payload["queue_depth"] == 2
    assert payload["worker_throughput"] == 4
