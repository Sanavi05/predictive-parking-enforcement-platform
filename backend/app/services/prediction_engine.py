from app.schemas.request import PredictionRequest
from app.schemas.response import PredictionResponse
from app.services.ml_service import ml_service
from app.services.risk_engine import recommended_action, risk_level_from_score
from app.utils.geo_utils import lat_lng_to_h3


class PredictionEngine:
    def predict(self, payload: PredictionRequest) -> PredictionResponse:
        payload.validate_coordinates()
        h3_cell = lat_lng_to_h3(payload.latitude, payload.longitude)
        features = [
            payload.latitude,
            payload.longitude,
            float(payload.time.hour),
            float(payload.time.weekday()),
            float(abs(hash(h3_cell)) % 100),
        ]
        risk_score = max(0, min(100, ml_service.predict_hotspot(features)))
        predicted_violations = max(0, ml_service.predict_volume(features))
        congestion_impact = max(0, min(100, ml_service.predict_congestion(features)))
        risk_level = risk_level_from_score(risk_score)
        return PredictionResponse(
            risk_score=round(risk_score, 2),
            predicted_violations=predicted_violations,
            risk_level=risk_level,
            congestion_impact=round(congestion_impact, 2),
            recommended_action=recommended_action(risk_level, predicted_violations),
        )
