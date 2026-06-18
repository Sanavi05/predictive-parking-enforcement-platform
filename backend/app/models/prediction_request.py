from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.utils.geo_utils import validate_latitude_longitude


class PredictionRequest(BaseModel):
    latitude: float = Field(..., examples=[12.9716])
    longitude: float = Field(..., examples=[77.5946])
    timestamp: datetime = Field(..., examples=["2026-06-18T14:00:00"])

    @field_validator("longitude")
    @classmethod
    def longitude_range(cls, value: float) -> float:
        if not -180 <= value <= 180:
            raise ValueError("longitude must be between -180 and 180")
        return value

    @field_validator("latitude")
    @classmethod
    def latitude_range(cls, value: float) -> float:
        if not -90 <= value <= 90:
            raise ValueError("latitude must be between -90 and 90")
        return value

    def validate_coordinates(self) -> None:
        validate_latitude_longitude(self.latitude, self.longitude)
