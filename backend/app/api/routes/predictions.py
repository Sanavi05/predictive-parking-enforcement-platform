from fastapi import APIRouter

from app.schemas.request import PredictionRequest
from app.schemas.response import PredictionResponse
from app.services.prediction_engine import prediction_engine
from app.schemas.response import ExplanationResponse, PredictionResponse

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

@router.post("/predict/explain", response_model=ExplanationResponse)
def explain_prediction(payload: PredictionRequest) -> ExplanationResponse:
    payload.validate_coordinates()
    return ExplanationResponse(
        **prediction_engine.explain(
            latitude=payload.latitude,
            longitude=payload.longitude,
            timestamp=payload.timestamp,
        )
    )