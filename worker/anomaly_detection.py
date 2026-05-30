from datetime import date


def detect_anomalies(result: dict) -> list[str]:
    anomalies: list[str] = []
    if not result.get("vin"):
        anomalies.append("missing_vin")

    odometer = result.get("odometer_km")
    if isinstance(odometer, int) and odometer > 900_000:
        anomalies.append("suspicious_odometer_reading")

    service_date = result.get("service_date")
    try:
        parsed = date.fromisoformat(str(service_date))
        if parsed > date.today():
            anomalies.append("future_service_date")
    except (TypeError, ValueError):
        anomalies.append("unparseable_service_date")

    if result.get("confidence_score", 1) < 0.70:
        anomalies.append("low_confidence_extraction")

    return anomalies

