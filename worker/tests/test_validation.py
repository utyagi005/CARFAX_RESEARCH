from anomaly_detection import detect_anomalies
from validation import validate_extraction


def test_validation_flags_invalid_vehicle_fields():
    result = {
        "vin": "BADVIN",
        "service_date": "30-05-2026",
        "odometer_km": -4,
        "confidence_score": 0.42,
    }

    errors = validate_extraction(result)

    assert "VIN must be 17 characters." in errors
    assert "service_date must use YYYY-MM-DD format." in errors
    assert "odometer_km must be between 0 and 1,000,000." in errors
    assert "confidence_score is below review threshold." in errors


def test_anomaly_detection_flags_missing_vin_and_odometer_jump():
    result = {"vin": None, "odometer_km": 980000, "service_date": "2026-05-30"}

    anomalies = detect_anomalies(result)

    assert "missing_vin" in anomalies
    assert "suspicious_odometer_reading" in anomalies

