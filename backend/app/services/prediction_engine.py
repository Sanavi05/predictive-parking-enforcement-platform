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
            "simulation_curve": compute_simulation_curve(risk_score, congestion_score),
        }

    def explain(self, latitude: float, longitude: float, timestamp: datetime) -> dict[str, Any]:
        features = self.feature_builder.build(latitude, longitude, timestamp)
        drivers = []

        # 1. Time of day / Rush Hour
        time_period = features.get("time_period", "")
        hour = features.get("hour", 0)
        if time_period in ("peak_morning", "peak_evening"):
            label = "Peak Morning (08:00–12:00)" if time_period == "peak_morning" else "Peak Evening (17:00–21:00)"
            drivers.append({"label": "Rush Hour", "impact": 31.0, "direction": "increase", "detail": label})
        elif time_period == "night":
            drivers.append({"label": "Night Hours", "impact": 12.0, "direction": "decrease", "detail": f"Low activity period ({hour:02d}:00)"})
        else:
            drivers.append({"label": "Off-Peak Hours", "impact": 8.0, "direction": "neutral", "detail": f"Moderate activity ({hour:02d}:00)"})

        # 2. Weekend effect
        is_weekend = features.get("is_weekend", 0)
        if is_weekend:
            drivers.append({"label": "Weekend Effect", "impact": 18.0, "direction": "increase", "detail": "Weekends see higher spillover parking"})
        else:
            drivers.append({"label": "Weekday Pattern", "impact": 10.0, "direction": "neutral", "detail": "Regular weekday violation pattern"})

        # 3. Junction Risk
        junction_importance = features.get("junction_importance", 0.0)
        at_junction = features.get("at_junction", 0)
        if junction_importance > 0.7 or at_junction:
            drivers.append({"label": "Junction Risk", "impact": round(junction_importance * 30, 1), "direction": "increase", "detail": "High-importance junction with frequent violations"})
        elif junction_importance > 0.3:
            drivers.append({"label": "Junction Risk", "impact": round(junction_importance * 20, 1), "direction": "increase", "detail": "Moderate junction activity"})
        else:
            drivers.append({"label": "Junction Risk", "impact": 5.0, "direction": "neutral", "detail": "Low junction activity in this area"})

        # 4. Historical Pattern
        cell_historical_avg = features.get("cell_historical_avg", 0.0)
        lag_24h = features.get("lag_24h", 0.0)
        if cell_historical_avg > 10:
            impact = min(round(cell_historical_avg / 2, 1), 28.0)
            drivers.append({"label": "Historical Pattern", "impact": impact, "direction": "increase", "detail": f"Zone avg {cell_historical_avg:.1f} violations/hour historically"})
        elif cell_historical_avg > 3:
            drivers.append({"label": "Historical Pattern", "impact": 14.0, "direction": "increase", "detail": f"Moderate historical activity ({cell_historical_avg:.1f} avg)"})
        else:
            drivers.append({"label": "Historical Pattern", "impact": 6.0, "direction": "neutral", "detail": "Low historical violation rate in this zone"})

        # 5. Vehicle Mix
        car_pct = features.get("car_pct", 0.0)
        two_wheeler_pct = features.get("two_wheeler_pct", 0.0)
        if car_pct > 0.5:
            drivers.append({"label": "Vehicle Mix", "impact": round(car_pct * 15, 1), "direction": "increase", "detail": f"Car-dominant zone ({car_pct*100:.0f}%) — higher congestion weight"})
        elif two_wheeler_pct > 0.5:
            drivers.append({"label": "Vehicle Mix", "impact": round(two_wheeler_pct * 8, 1), "direction": "neutral", "detail": f"Two-wheeler dominant ({two_wheeler_pct*100:.0f}%) — lower congestion impact"})
        else:
            drivers.append({"label": "Vehicle Mix", "impact": 7.0, "direction": "neutral", "detail": "Mixed vehicle distribution"})

        # 6. Violation Density
        h3_total = features.get("h3_total_violations", 0.0)
        h3_density = features.get("h3_hour_density", 0.0)
        if h3_total > 100:
            drivers.append({"label": "Zone Violation Density", "impact": min(round(h3_density * 20, 1), 25.0), "direction": "increase", "detail": f"High-density zone ({h3_total:.0f} total violations recorded)"})
        elif h3_total > 20:
            drivers.append({"label": "Zone Violation Density", "impact": 12.0, "direction": "increase", "detail": f"Moderate density zone ({h3_total:.0f} violations)"})
        else:
            drivers.append({"label": "Zone Violation Density", "impact": 4.0, "direction": "neutral", "detail": "Sparse violation history in this zone"})

        # Sort by impact descending
        drivers.sort(key=lambda d: d["impact"], reverse=True)

        # Summary
        top = drivers[0]
        summary = f"Primary driver is {top['label']} contributing {top['impact']:.0f}% to predicted risk."

        return {"drivers": drivers, "summary": summary}


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

def compute_simulation_curve(risk_score: float, congestion_score: float) -> list[float]:
    """
    Returns violation reduction % for 1–6 officers.
    Higher base risk = more room for reduction.
    """
    base = (risk_score + congestion_score) / 2
    curve = []
    for officers in range(1, 7):
        # Diminishing returns: each officer adds less than the previous
        reduction = base * (1 - (0.75 ** officers))
        curve.append(round(min(reduction, 95.0), 1))
    return curve

prediction_engine = PredictionEngine()