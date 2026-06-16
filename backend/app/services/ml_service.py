from pathlib import Path
from typing import Any

import joblib
import numpy as np

from app.core.logging import logger


class MLService:
    def __init__(self, model_dir: Path | None = None) -> None:
        self.model_dir = model_dir or Path(__file__).resolve().parents[1] / "ml_models"
        self.models: dict[str, Any] = {}

    def load_models(self) -> None:
        model_files = {
            "hotspot": "hotspot_model.pkl",
            "volume": "volume_model.pkl",
            "congestion": "congestion_model.pkl",
        }
        for name, filename in model_files.items():
            path = self.model_dir / filename
            if not path.exists():
                logger.warning("ML model missing: %s", path)
                continue
            try:
                self.models[name] = joblib.load(path)
                logger.info("Loaded %s model from %s", name, path)
            except Exception as exc:
                logger.exception("Could not load %s model: %s", name, exc)

    def predict_hotspot(self, features: list[float]) -> float:
        return self._predict("hotspot", features, fallback=self._mock_risk(features))

    def predict_volume(self, features: list[float]) -> int:
        return int(round(self._predict("volume", features, fallback=self._mock_volume(features))))

    def predict_congestion(self, features: list[float]) -> float:
        return self._predict("congestion", features, fallback=self._mock_congestion(features))

    def _predict(self, model_name: str, features: list[float], fallback: float) -> float:
        model = self.models.get(model_name)
        if model is None:
            return fallback
        try:
            prediction = model.predict(np.array([features]))[0]
            return float(prediction)
        except Exception as exc:
            logger.exception("Prediction failed for %s model: %s", model_name, exc)
            return fallback

    def _mock_risk(self, features: list[float]) -> float:
        latitude, longitude, hour, day = features[:4]
        commute_pressure = 28 if hour in range(8, 11) or hour in range(17, 21) else 12
        centrality = max(0, 35 - abs(latitude - 12.9716) * 70 - abs(longitude - 77.5946) * 55)
        weekend_factor = 8 if day in (5, 6) else 0
        return round(min(98, 25 + commute_pressure + centrality + weekend_factor), 2)

    def _mock_volume(self, features: list[float]) -> float:
        risk = self._mock_risk(features)
        return max(5, round(risk * 0.46))

    def _mock_congestion(self, features: list[float]) -> float:
        risk = self._mock_risk(features)
        return round(min(100, risk * 0.82 + 9), 2)


ml_service = MLService()
