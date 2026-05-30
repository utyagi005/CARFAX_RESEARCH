from pydantic import BaseModel, Field


class ExtractionResult(BaseModel):
    vin: str | None = None
    vehicle_make: str | None = None
    vehicle_model: str | None = None
    vehicle_year: int | None = None
    odometer_km: int | None = None
    service_date: str | None = None
    service_type: str | None = None
    confidence_score: float = 0.0
    validation_errors: list[str] = Field(default_factory=list)
    anomaly_flags: list[str] = Field(default_factory=list)

