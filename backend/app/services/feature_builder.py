from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from app.core.logging import logger

try:
    import h3
except ImportError:  # pragma: no cover - startup validation catches this in deployed envs.
    h3 = None


def _project_root() -> Path:
    for parent in Path(__file__).resolve().parents:
        if (parent / "datasets").exists():
            return parent
    return Path(__file__).resolve().parents[3]


PROJECT_ROOT = _project_root()
DATASET_ROOT = PROJECT_ROOT / "datasets"


class FeatureBuilder:
    def __init__(self, dataset_root: Path | None = None) -> None:
        self.dataset_root = dataset_root or DATASET_ROOT
        self.volume_history = self._load_volume_history()
        self.parking_history = self._load_parking_history()

    def build(self, latitude: float, longitude: float, timestamp: datetime) -> dict[str, Any]:
        h3_cell = self.h3_cell_from_coordinates(latitude, longitude)
        features: dict[str, Any] = {
            "h3_cell": h3_cell,
            "latitude": latitude,
            "longitude": longitude,
            "hour": timestamp.hour,
            "day_of_week": timestamp.weekday(),
            "month": timestamp.month,
            "week_of_year": int(timestamp.isocalendar().week),
            "is_weekend": int(timestamp.weekday() >= 5),
            "time_period": self._time_period(timestamp.hour),
        }
        features.update(self._volume_features(h3_cell, timestamp))
        features.update(self._parking_mix_features(h3_cell, timestamp))
        features.update(self._congestion_defaults(h3_cell, timestamp))
        return self._clean(features)

    def h3_cell_from_coordinates(self, latitude: float, longitude: float, resolution: int = 8) -> str:
        if h3 is not None:
            if hasattr(h3, "latlng_to_cell"):
                return str(h3.latlng_to_cell(latitude, longitude, resolution))
            return str(h3.geo_to_h3(latitude, longitude, resolution))
        return self._nearest_known_h3_cell(latitude, longitude)

    def _load_volume_history(self) -> pd.DataFrame:
        path = self.dataset_root / "model2_volume_predictor.csv"
        frame = pd.read_csv(path)
        frame["datetime"] = pd.to_datetime(frame["datetime"], errors="coerce").dt.tz_localize(None)
        return frame.sort_values("datetime")

    def _load_parking_history(self) -> pd.DataFrame:
        path = self.dataset_root / "parksight_processed.csv"
        frame = pd.read_csv(path)
        frame["created_datetime"] = pd.to_datetime(frame["created_datetime"], errors="coerce", utc=True).dt.tz_convert(None)
        return frame.sort_values("created_datetime")

    def _volume_features(self, h3_cell: str, timestamp: datetime) -> dict[str, Any]:
        history = self.volume_history[self.volume_history["datetime"] < self._naive(timestamp)]
        cell_history = history[history["h3_cell"] == h3_cell]
        if cell_history.empty:
            cell_history = history

        counts = cell_history["violation_count"].astype(float)

        lag_1h = self._last(counts, 1)
        lag_2h = self._last(counts, 2)
        lag_3h = self._last(counts, 3)
        lag_24h = self._last(counts, 24)
        lag_168h = self._last(counts, 168)

        same_hour = cell_history[cell_history["hour"] == timestamp.hour]
        weekend_history = cell_history[cell_history["is_weekend"] == int(timestamp.weekday() >= 5)]

        return {
            "lag_1h": lag_1h,
            "lag_2h": lag_2h,
            "lag_3h": lag_3h,
            "lag_24h": lag_24h,
            "lag_168h": lag_168h,
            "rolling_3h_mean": self._tail_mean(counts, 3),
            "rolling_6h_mean": self._tail_mean(counts, 6),
            "rolling_12h_mean": self._tail_mean(counts, 12),
            "rolling_24h_mean": self._tail_mean(counts, 24),
            "count_change_1h": lag_1h - lag_2h,
            "count_change_24h": lag_1h - lag_24h,
            "growth_rate": (lag_1h - lag_24h) / max(lag_24h, 1.0),
            "cell_historical_avg": self._mean(counts),
            "cell_peak_hour_avg": self._mean(same_hour["violation_count"]),
            "cell_weekend_avg": self._mean(weekend_history["violation_count"]),
        }

    def _parking_mix_features(self, h3_cell: str, timestamp: datetime) -> dict[str, Any]:
        history = self.parking_history[self.parking_history["created_datetime"] < self._naive(timestamp)]
        cell_history = history[history["h3_cell"] == h3_cell]
        if cell_history.empty:
            cell_history = history

        total_rows = max(len(cell_history), 1)
        vehicle_category = cell_history.get("vehicle_category", pd.Series(dtype=str)).astype(str).str.lower()
        primary_violation = cell_history.get("primary_violation", pd.Series(dtype=str)).astype(str).str.upper()

        return {
            "h3_total_violations": self._mean(cell_history.get("h3_total_violations", pd.Series(dtype=float))),
            "h3_unique_vehicles": self._mean(cell_history.get("h3_unique_vehicles", pd.Series(dtype=float))),
            "h3_hour_density": self._mean(cell_history.get("h3_hour_density", pd.Series(dtype=float))),
            "at_junction": int(self._mean(cell_history.get("at_junction", pd.Series(dtype=float))) >= 0.5),
            "at_junction_pct": self._mean(cell_history.get("at_junction", pd.Series(dtype=float))),
            "two_wheeler_pct": float((vehicle_category == "two_wheeler").sum() / total_rows),
            "car_pct": float((vehicle_category == "car").sum() / total_rows),
            "auto_pct": float((vehicle_category == "auto").sum() / total_rows),
            "no_parking_pct": float(primary_violation.str.contains("NO PARKING", na=False).sum() / total_rows),
            "wrong_parking_pct": float(primary_violation.str.contains("WRONG PARKING", na=False).sum() / total_rows),
            "main_road_pct": self._mean(cell_history.get("vt_parking_in_a_main_road", pd.Series(dtype=float))),
            "violation_count_slot": self._slot_count(cell_history, timestamp.hour),
        }

    def _congestion_defaults(self, h3_cell: str, timestamp: datetime) -> dict[str, Any]:
        history = self.parking_history[self.parking_history["created_datetime"] < self._naive(timestamp)]
        cell_history = history[history["h3_cell"] == h3_cell]
        if cell_history.empty:
            cell_history = history

        vt_columns = [
            "vt_no_parking",
            "vt_wrong_parking",
            "vt_parking_in_a_main_road",
            "vt_parking_near_road_crossing",
            "vt_parking_on_footpath",
            "vt_double_parking",
            "vt_parking_near_bustop_school_hospital_etc",
        ]
        features = {column: self._mean(cell_history.get(column, pd.Series(dtype=float))) for column in vt_columns}
        features.update(
            {
                "vehicle_category": self._mode(cell_history.get("vehicle_category", pd.Series(dtype=str)), "other"),
                "vehicle_weight": self._vehicle_weight(cell_history.get("vehicle_category", pd.Series(dtype=str))),
                "junction_importance": self._mean(cell_history.get("at_junction", pd.Series(dtype=float))),
                "station_density": self._mode_count(cell_history.get("police_station", pd.Series(dtype=str))),
                "violation_count": self._slot_count(cell_history, timestamp.hour),
                "offence_code_count": self._mean(cell_history.get("offence_code_count", pd.Series(dtype=float))),
            }
        )
        return features

    def _slot_count(self, frame: pd.DataFrame, hour: int) -> float:
        if frame.empty or "hour" not in frame:
            return 0.0
        return float(frame[frame["hour"] == hour]["violation_count"].sum())

    def _time_period(self, hour: int) -> str:
        if 5 <= hour < 8:
            return "morning"
        if 8 <= hour < 12:
            return "peak_morning"
        if 12 <= hour < 17:
            return "afternoon"
        if 17 <= hour < 21:
            return "peak_evening"
        if 21 <= hour < 24:
            return "night"
        return "early_morning"

    def _vehicle_weight(self, series: pd.Series) -> float:
        weights = {"two_wheeler": 0.6, "auto": 0.8, "car": 1.0, "bus": 1.8, "truck": 2.0, "other": 1.0}
        category = self._mode(series.astype(str).str.lower(), "other")
        return weights.get(category, 1.0)

    def _mode(self, series: pd.Series, default: str) -> str:
        if series.empty:
            return default
        mode = series.dropna().astype(str).mode()
        return default if mode.empty else str(mode.iloc[0])

    def _mode_count(self, series: pd.Series) -> float:
        if series.empty:
            return 0.0
        counts = series.dropna().astype(str).value_counts()
        return 0.0 if counts.empty else float(counts.iloc[0])

    def _last(self, series: pd.Series, index: int) -> float:
        if len(series) < index:
            return 0.0
        return float(series.iloc[-index])

    def _tail_mean(self, series: pd.Series, window: int) -> float:
        return self._mean(series.tail(window))

    def _mean(self, series: pd.Series) -> float:
        if series.empty:
            return 0.0
        return float(np.nan_to_num(pd.to_numeric(series, errors="coerce").mean()))

    def _clean(self, features: dict[str, Any]) -> dict[str, Any]:
        clean: dict[str, Any] = {}
        for key, value in features.items():
            if isinstance(value, np.generic):
                value = value.item()
            if isinstance(value, float):
                value = float(np.nan_to_num(value))
            clean[key] = value
        return clean

    def _nearest_known_h3_cell(self, latitude: float, longitude: float) -> str:
        if self.parking_history.empty:
            raise RuntimeError("h3 is required when no parking history is available")

        required_columns = {"latitude", "longitude", "h3_cell"}
        if not required_columns.issubset(self.parking_history.columns):
            raise RuntimeError("parking history must include latitude, longitude, and h3_cell columns")

        coordinates = self.parking_history[["latitude", "longitude", "h3_cell"]].dropna()
        if coordinates.empty:
            raise RuntimeError("parking history does not contain coordinates for h3 fallback")

        distances = (coordinates["latitude"].astype(float) - latitude) ** 2 + (coordinates["longitude"].astype(float) - longitude) ** 2
        nearest_index = distances.idxmin()
        return str(coordinates.loc[nearest_index, "h3_cell"])

    def _naive(self, timestamp: datetime) -> datetime:
        if timestamp.tzinfo is None:
            return timestamp
        return timestamp.astimezone().replace(tzinfo=None)

