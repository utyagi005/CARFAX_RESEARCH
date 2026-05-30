import re
from datetime import date

VIN_PATTERN = re.compile(r"\b[A-HJ-NPR-Z0-9]{17}\b", re.IGNORECASE)
ODOMETER_PATTERN = re.compile(r"(?:odometer|mileage|km)\D{0,20}(\d{4,7})", re.IGNORECASE)
DATE_PATTERN = re.compile(r"\b(20\d{2}-\d{2}-\d{2})\b")


def _vehicle_from_filename(filename: str) -> tuple[str, str, int]:
    normalized = filename.lower()
    if "toyota" in normalized or "camry" in normalized:
        return "Toyota", "Camry", 2021
    if "ford" in normalized or "f150" in normalized:
        return "Ford", "F-150", 2019
    if "tesla" in normalized or "model3" in normalized:
        return "Tesla", "Model 3", 2022
    return "Honda", "Accord", 2020


def validate_extraction(result: dict) -> list[str]:
    errors: list[str] = []
    if not result.get("vin") or len(str(result.get("vin"))) != 17:
        errors.append("VIN must be 17 characters.")
    try:
        date.fromisoformat(str(result.get("service_date")))
    except (TypeError, ValueError):
        errors.append("service_date must use YYYY-MM-DD format.")
    odometer = result.get("odometer_km")
    if not isinstance(odometer, int) or odometer < 0 or odometer > 1_000_000:
        errors.append("odometer_km must be between 0 and 1,000,000.")
    if float(result.get("confidence_score") or 0) < 0.70:
        errors.append("confidence_score is below review threshold.")
    return errors


def detect_anomalies(result: dict) -> list[str]:
    anomalies: list[str] = []
    if not result.get("vin"):
        anomalies.append("missing_vin")
    odometer = result.get("odometer_km")
    if isinstance(odometer, int) and odometer > 900_000:
        anomalies.append("suspicious_odometer_reading")
    return anomalies


def run_mock_extraction(filename: str, text: str) -> dict:
    vin_match = VIN_PATTERN.search(text)
    odometer_match = ODOMETER_PATTERN.search(text)
    date_match = DATE_PATTERN.search(text)
    make, model, year = _vehicle_from_filename(filename)
    lowered = f"{filename} {text}".lower()
    service_type = "Brake inspection" if "brake" in lowered else "Inspection report" if "inspection" in lowered else "Maintenance record"
    result = {
        "vin": vin_match.group(0).upper() if vin_match else None,
        "vehicle_make": make,
        "vehicle_model": model,
        "vehicle_year": year,
        "odometer_km": int(odometer_match.group(1)) if odometer_match else 84250,
        "service_date": date_match.group(1) if date_match else date.today().isoformat(),
        "service_type": service_type,
        "confidence_score": 0.94 if vin_match else 0.66,
        "provider": "mock",
        "validation_errors": [],
        "anomaly_flags": [],
    }
    result["validation_errors"] = validate_extraction(result)
    result["anomaly_flags"] = detect_anomalies(result)
    return result

