from pydantic import BaseModel


class PredictionResponse(BaseModel):
    predicted_violations: float
    risk_score: float
    risk_level: str
    congestion_score: float
    congestion_level: str
    recommended_officers: int
    recommended_tow_trucks: int
