from app.services.model_predictor import ModelPredictor


class CongestionPredictor(ModelPredictor):
    def __init__(self) -> None:
        super().__init__("congestion")

    def load(self) -> None:
        super().load()
        if isinstance(self.model, dict):
            bundle = self.model
            self.model = bundle["regression_pipeline"]
            self.features = [str(feature) for feature in bundle.get("feature_cols", self.features)]

    def predict(self, feature_dict: dict) -> float:
        return max(0.0, min(100.0, super().predict(feature_dict)))
