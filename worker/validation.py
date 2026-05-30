from datetime import date


def validate_extraction(result: dict) -> list[str]:
    errors: list[str] = []
    vin = result.get("vin")
    if not vin or len(str(vin)) != 17:
        errors.append("VIN must be 17 characters.")

    service_date = result.get("service_date")
    try:
        date.fromisoformat(str(service_date))
    except (TypeError, ValueError):
        errors.append("service_date must use YYYY-MM-DD format.")

    odometer = result.get("odometer_km")
    if not isinstance(odometer, int) or odometer < 0 or odometer > 1_000_000:
        errors.append("odometer_km must be between 0 and 1,000,000.")

    confidence = float(result.get("confidence_score") or 0)
    if confidence < 0.70:
        errors.append("confidence_score is below review threshold.")

    return errors

