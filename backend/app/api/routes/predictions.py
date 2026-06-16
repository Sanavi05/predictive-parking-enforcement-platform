from fastapi import APIRouter

from app.schemas.request import PredictionRequest
from app.schemas.response import PredictionResponse
from app.services.prediction_engine import PredictionEngine

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
def predict_future_risk(payload: PredictionRequest) -> PredictionResponse:
    return PredictionEngine().predict(payload)
