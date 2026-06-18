from __future__ import annotations

from datetime import datetime
from typing import Any

from app.services.congestion_predictor import CongestionPredictor
from app.services.feature_builder import FeatureBuilder
from app.services.hotspot_predictor import HotspotPredictor
from app.services.volume_predictor import VolumePredictor


class PredictionEngine:
    def __init__(self) -> None:
        self.feature_builder = FeatureBuilder()
        self.volume_model = VolumePredictor()
        self.hotspot_model = HotspotPredictor()
        self.congestion_model = CongestionPredictor()

    def load_models(self) -> None:
        self.volume_model.load()
        self.hotspot_model.load()
        self.congestion_model.load()

    def predict(self, latitude: float, longitude: float, timestamp: datetime) -> dict[str, Any]:
        features = self.feature_builder.build(latitude, longitude, timestamp)
        volume = self.volume_model.predict(features)
        risk = self.hotspot_model.predict(features)
        congestion = self.congestion_model.predict(features)

        predicted_violations = round(volume, 2)
        risk_score = round(max(0.0, min(100.0, risk)), 2)
        congestion_score = round(max(0.0, min(100.0, congestion)), 2)

        return {
            "predicted_violations": predicted_violations,
            "risk_score": risk_score,
            "risk_level": risk_level_from_score(risk_score),
            "congestion_score": congestion_score,
            "congestion_level": congestion_level_from_score(congestion_score),
            "recommended_officers": recommended_officers(risk_score),
            "recommended_tow_trucks": recommended_tow_trucks(congestion_score),
        }


def risk_level_from_score(score: float) -> str:
    if score < 30:
        return "Low"
    if score < 60:
        return "Medium"
    if score < 80:
        return "High"
    return "Critical"


def congestion_level_from_score(score: float) -> str:
    if score < 30:
        return "Low"
    if score < 60:
        return "Moderate"
    if score < 80:
        return "High"
    return "Severe"


def recommended_officers(risk_score: float) -> int:
    if risk_score < 30:
        return 1
    if risk_score < 60:
        return 2
    if risk_score < 80:
        return 3
    return 4


def recommended_tow_trucks(congestion_score: float) -> int:
    if congestion_score < 50:
        return 0
    if congestion_score < 80:
        return 1
    return 2


prediction_engine = PredictionEngine()
