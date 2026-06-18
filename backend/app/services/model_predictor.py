from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from app.core.logging import logger


def _project_root() -> Path:
    for parent in Path(__file__).resolve().parents:
        if (parent / "models").exists():
            return parent
    return Path(__file__).resolve().parents[3]


PROJECT_ROOT = _project_root()
MODEL_ROOT = PROJECT_ROOT / "models"


class ModelArtifactError(RuntimeError):
    """Raised when a trained model artifact cannot be loaded."""


class ModelPredictor:
    def __init__(self, name: str, model_dir: Path | None = None) -> None:
        self.name = name
        self.model_dir = model_dir or MODEL_ROOT / name
        self.model: Any | None = None
        self.features: list[str] = []
        self.metadata: dict[str, Any] = {}
        self.metrics: dict[str, Any] = {}

    @property
    def is_loaded(self) -> bool:
        return self.model is not None and bool(self.features)

    def load(self) -> None:
        model_path = self.model_dir / f"{self.name}_model.pkl"
        features_path = self.model_dir / f"{self.name}_features.pkl"
        metadata_path = self.model_dir / f"{self.name}_metadata.json"
        metrics_path = self.model_dir / f"{self.name}_metrics.json"

        for path in (model_path, features_path, metadata_path, metrics_path):
            if not path.exists():
                raise ModelArtifactError(f"Missing {self.name} artifact: {path}")

        self.model = joblib.load(model_path)
        loaded_features = joblib.load(features_path)
        self.features = [str(feature) for feature in loaded_features]
        self.metadata = json.loads(metadata_path.read_text())
        self.metrics = json.loads(metrics_path.read_text())

        if not self.features:
            raise ModelArtifactError(f"{features_path} did not contain any features")

        logger.info(
            "Loaded %s model with %d features. Metrics: %s",
            self.name,
            len(self.features),
            self.metrics,
        )

    def predict(self, feature_dict: dict[str, Any]) -> float:
        if not self.is_loaded:
            raise ModelArtifactError(f"{self.name} model is not loaded")

        row = {feature: feature_dict.get(feature, 0) for feature in self.features}
        frame = pd.DataFrame([row], columns=self.features)
        prediction = self.model.predict(frame)[0]
        return float(prediction)
