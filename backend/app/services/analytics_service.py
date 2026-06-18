from __future__ import annotations

from pathlib import Path

import pandas as pd
from sqlalchemy import desc, extract, func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.logging import logger
from app.models.violation import Violation
from app.schemas.response import AnalyticsResponse, CountBucket, DashboardSummaryResponse, HotspotResponse


def _project_root() -> Path:
    for parent in Path(__file__).resolve().parents:
        if (parent / "datasets").exists():
            return parent
    return Path(__file__).resolve().parents[3]


DATASET_PATH = _project_root() / "datasets" / "parksight_processed.csv"


class AnalyticsService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_historical_analytics(self) -> AnalyticsResponse:
        try:
            total = self.db.query(func.count(Violation.id)).scalar() or 0
            if total > 0:
                return AnalyticsResponse(
                    total_violations=total,
                    violations_by_hour=self._bucket_by(extract("hour", Violation.timestamp)),
                    violations_by_vehicle_type=self._bucket_by(Violation.vehicle_type),
                    top_junctions=self._bucket_by(Violation.junction_name, limit=10),
                    top_police_stations=self._bucket_by(Violation.police_station, limit=10),
                    peak_periods=self._peak_periods(),
                )
        except SQLAlchemyError as exc:
            logger.warning("Analytics query failed; using processed dataset: %s", exc)
        return self._dataset_analytics()

    def get_hotspot_heatmap(self) -> list[HotspotResponse]:
        try:
            rows = (
                self.db.query(
                    Violation.latitude,
                    Violation.longitude,
                    func.count(Violation.id).label("count"),
                )
                .group_by(Violation.latitude, Violation.longitude)
                .order_by(desc("count"))
                .limit(50)
                .all()
            )
            if rows:
                max_count = max(row.count for row in rows)
                return [
                    HotspotResponse(latitude=row.latitude, longitude=row.longitude, risk_score=round((row.count / max_count) * 100, 2))
                    for row in rows
                ]
        except SQLAlchemyError as exc:
            logger.warning("Hotspot query failed; using processed dataset: %s", exc)
        return self._dataset_hotspots()

    def get_dashboard_summary(self) -> DashboardSummaryResponse:
        hotspots = self.get_hotspot_heatmap()
        analytics = self.get_historical_analytics()
        return DashboardSummaryResponse(
            critical_zones=sum(1 for zone in hotspots if zone.risk_score >= 80),
            high_risk_zones=sum(1 for zone in hotspots if 60 <= zone.risk_score < 80),
            expected_violations_today=int(analytics.total_violations),
            average_congestion_score=round(
                min(100.0, sum(zone.risk_score for zone in hotspots) / max(len(hotspots), 1) * 0.75),
                2,
            ),
        )

    def _bucket_by(self, column, limit: int | None = None) -> list[CountBucket]:
        query = self.db.query(column.label("label"), func.count(Violation.id).label("count")).group_by(column).order_by(desc("count"))
        if limit:
            query = query.limit(limit)
        return [CountBucket(label=str(row.label), count=row.count) for row in query.all()]

    def _peak_periods(self) -> list[str]:
        buckets = self._bucket_by(extract("hour", Violation.timestamp), limit=3)
        return [f"{bucket.label}:00" for bucket in buckets]

    def _dataset(self) -> pd.DataFrame:
        frame = pd.read_csv(DATASET_PATH)
        frame["created_datetime"] = pd.to_datetime(frame["created_datetime"], errors="coerce")
        return frame

    def _dataset_analytics(self) -> AnalyticsResponse:
        frame = self._dataset()
        return AnalyticsResponse(
            total_violations=int(len(frame)),
            violations_by_hour=self._series_buckets(frame["hour"]),
            violations_by_vehicle_type=self._series_buckets(frame["vehicle_type"]),
            top_junctions=self._series_buckets(frame["junction_name"], limit=10),
            top_police_stations=self._series_buckets(frame["police_station"], limit=10),
            peak_periods=[f"{bucket.label}:00" for bucket in self._series_buckets(frame["hour"], limit=3)],
        )

    def _dataset_hotspots(self) -> list[HotspotResponse]:
        frame = self._dataset()
        grouped = (
            frame.groupby(["h3_cell", "latitude", "longitude"], dropna=True)
            .size()
            .reset_index(name="total")
            .sort_values("total", ascending=False)
            .head(50)
        )
        max_count = max(int(grouped["total"].max()), 1)
        return [
            HotspotResponse(
                latitude=float(row.latitude),
                longitude=float(row.longitude),
                risk_score=round((float(row.total) / max_count) * 100, 2),
            )
            for row in grouped.itertuples(index=False)
        ]

    def _series_buckets(self, series: pd.Series, limit: int | None = None) -> list[CountBucket]:
        counts = series.fillna("Unknown").astype(str).value_counts()
        if limit:
            counts = counts.head(limit)
        return [CountBucket(label=str(label), count=int(count)) for label, count in counts.items()]
