from app.services.model_predictor import ModelPredictor


class HotspotPredictor(ModelPredictor):
    def __init__(self) -> None:
        super().__init__("hotspot")

    def predict(self, feature_dict: dict) -> float:
        raw_prediction = super().predict(feature_dict)
        if 0.0 <= raw_prediction <= 1.0:
            return raw_prediction * 100.0
        return max(0.0, min(100.0, raw_prediction))
