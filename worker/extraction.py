import re
from datetime import date


VIN_PATTERN = re.compile(r"\b[A-HJ-NPR-Z0-9]{17}\b", re.IGNORECASE)
ODOMETER_PATTERN = re.compile(r"(?:odometer|mileage|km)\D{0,20}(\d{4,7})", re.IGNORECASE)


def _vehicle_from_filename(filename: str) -> tuple[str, str, int]:
    normalized = filename.lower()
    if "toyota" in normalized or "camry" in normalized:
        return "Toyota", "Camry", 2021
    if "ford" in normalized or "f150" in normalized:
        return "Ford", "F-150", 2019
    if "tesla" in normalized or "model3" in normalized:
        return "Tesla", "Model 3", 2022
    return "Honda", "Accord", 2020


def run_mock_extraction(filename: str, text: str) -> dict:
    vin_match = VIN_PATTERN.search(text)
    odometer_match = ODOMETER_PATTERN.search(text)
    make, model, year = _vehicle_from_filename(filename)
    lowered = f"{filename} {text}".lower()
    service_type = "Brake inspection" if "brake" in lowered else "Maintenance record"

    return {
        "vin": vin_match.group(0).upper() if vin_match else "1HGCM82633A004352",
        "vehicle_make": make,
        "vehicle_model": model,
        "vehicle_year": year,
        "odometer_km": int(odometer_match.group(1)) if odometer_match else 84250,
        "service_date": date.today().isoformat(),
        "service_type": service_type,
        "confidence_score": 0.91 if vin_match else 0.78,
        "validation_errors": [],
        "anomaly_flags": [],
    }

