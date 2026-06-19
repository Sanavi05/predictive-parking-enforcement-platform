from pydantic import BaseModel


class PredictionResponse(BaseModel):
    predicted_violations: float
    risk_score: float
    risk_level: str
    congestion_score: float
    congestion_level: str
    recommended_officers: int
    recommended_tow_trucks: int

class ExplanationDriver(BaseModel):
    label: str
    impact: float        # percentage contribution e.g. 31.0
    direction: str       # "increase" | "decrease" | "neutral"
    detail: str          # human readable e.g. "Peak Evening (17:00–21:00)"


class ExplanationResponse(BaseModel):
    drivers: list[ExplanationDriver]
    summary: str
