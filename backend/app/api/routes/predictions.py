from fastapi import APIRouter

from app.schemas.request import PredictionRequest
from app.schemas.response import PredictionResponse
from app.services.prediction_engine import prediction_engine

router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
def predict_future_risk(payload: PredictionRequest) -> PredictionResponse:
    payload.validate_coordinates()
    return PredictionResponse(
        **prediction_engine.predict(
            latitude=payload.latitude,
            longitude=payload.longitude,
            timestamp=payload.timestamp,
        )
    )
