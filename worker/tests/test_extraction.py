from extraction import run_mock_extraction


def test_mock_extraction_returns_vehicle_payload():
    result = run_mock_extraction(
        filename="honda_accord_invoice.txt",
        text="VIN 1HGCM82633A004352 odometer 84250 brake inspection",
    )

    assert result["vin"] == "1HGCM82633A004352"
    assert result["vehicle_make"] == "Honda"
    assert result["odometer_km"] == 84250
    assert 0.0 <= result["confidence_score"] <= 1.0
