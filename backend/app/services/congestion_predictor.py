from app.services.model_predictor import ModelPredictor


class CongestionPredictor(ModelPredictor):
    def __init__(self) -> None:
        super().__init__("congestion")

    def predict(self, feature_dict: dict) -> float:
        return max(0.0, min(100.0, super().predict(feature_dict)))
