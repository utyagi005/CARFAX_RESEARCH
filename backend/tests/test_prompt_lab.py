from fastapi.testclient import TestClient

from app.main import app


def test_prompt_lab_runs_mock_extraction():
    client = TestClient(app)

    response = client.post(
        "/prompt-lab/run",
        json={
            "filename": "toyota_camry_inspection.txt",
            "text": "VIN 4T1BF1FK5HU654321 odometer 61234 inspection passed",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["vin"] == "4T1BF1FK5HU654321"
    assert payload["vehicle_make"] == "Toyota"
    assert payload["validation_errors"] == []
