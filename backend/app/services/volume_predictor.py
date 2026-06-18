from app.services.model_predictor import ModelPredictor


class VolumePredictor(ModelPredictor):
    def __init__(self) -> None:
        super().__init__("volume")

    def predict(self, feature_dict: dict) -> float:
        return max(0.0, super().predict(feature_dict))
