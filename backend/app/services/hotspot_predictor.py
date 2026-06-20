import pandas as pd

from app.services.model_predictor import ModelPredictor


class HotspotPredictor(ModelPredictor):
    def __init__(self) -> None:
        super().__init__("hotspot")

    def predict(self, feature_dict: dict) -> float:
        if self.model is not None and hasattr(self.model, "predict_proba"):
            row = {feature: feature_dict.get(feature, 0) for feature in self.features}
            frame = pd.DataFrame([row], columns=self.features)
            probabilities = self.model.predict_proba(frame)[0]
            classes = [int(class_name) for class_name in getattr(self.model, "classes_", range(len(probabilities)))]
            probability_by_class = dict(zip(classes, probabilities))
            elevated_probability = float(probability_by_class.get(1, 0.0))
            spike_probability = float(probability_by_class.get(2, 0.0))
            return min(100.0, (elevated_probability * 60.0) + (spike_probability * 100.0))

        raw_prediction = super().predict(feature_dict)
        if 0.0 <= raw_prediction <= 1.0:
            return raw_prediction * 100.0
        if raw_prediction <= 2.0:
            return (raw_prediction / 2.0) * 100.0
        return max(0.0, min(100.0, raw_prediction))
