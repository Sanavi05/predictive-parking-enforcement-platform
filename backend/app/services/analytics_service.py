from sqlalchemy import desc, extract, func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.logging import logger
from app.models.violation import Violation
from app.schemas.response import AnalyticsResponse, CountBucket, HotspotResponse


MOCK_VIOLATIONS = [
    {"latitude": 12.9716, "longitude": 77.5946, "junction": "MG Road Metro", "station": "Cubbon Park", "vehicle": "Car", "hour": 8, "risk": 92},
    {"latitude": 12.9767, "longitude": 77.5713, "junction": "Majestic Bus Stand", "station": "Upparpet", "vehicle": "Two Wheeler", "hour": 9, "risk": 87},
    {"latitude": 12.9352, "longitude": 77.6245, "junction": "Sony World Junction", "station": "Koramangala", "vehicle": "Car", "hour": 18, "risk": 83},
    {"latitude": 12.9784, "longitude": 77.6408, "junction": "Indiranagar 100 Feet Road", "station": "Indiranagar", "vehicle": "Auto", "hour": 19, "risk": 78},
    {"latitude": 12.9141, "longitude": 77.6101, "junction": "Jayanagar 4th Block", "station": "Jayanagar", "vehicle": "Car", "hour": 11, "risk": 66},
]


class AnalyticsService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_historical_analytics(self) -> AnalyticsResponse:
        try:
            total = self.db.query(func.count(Violation.id)).scalar() or 0
            if total == 0:
                return self._mock_analytics()
            return AnalyticsResponse(
                total_violations=total,
                violations_by_hour=self._bucket_by(extract("hour", Violation.timestamp)),
                violations_by_vehicle_type=self._bucket_by(Violation.vehicle_type),
                top_junctions=self._bucket_by(Violation.junction_name, limit=10),
                top_police_stations=self._bucket_by(Violation.police_station, limit=10),
                peak_periods=self._peak_periods(),
            )
        except SQLAlchemyError as exc:
            logger.warning("Analytics query failed, returning mock data: %s", exc)
            return self._mock_analytics()

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
            if not rows:
                return self._mock_hotspots()
            max_count = max(row.count for row in rows)
            return [
                HotspotResponse(latitude=row.latitude, longitude=row.longitude, risk_score=round((row.count / max_count) * 100, 2))
                for row in rows
            ]
        except SQLAlchemyError as exc:
            logger.warning("Hotspot query failed, returning mock data: %s", exc)
            return self._mock_hotspots()

    def _bucket_by(self, column, limit: int | None = None) -> list[CountBucket]:
        query = self.db.query(column.label("label"), func.count(Violation.id).label("count")).group_by(column).order_by(desc("count"))
        if limit:
            query = query.limit(limit)
        return [CountBucket(label=str(row.label), count=row.count) for row in query.all()]

    def _peak_periods(self) -> list[str]:
        buckets = self._bucket_by(extract("hour", Violation.timestamp), limit=3)
        return [f"{bucket.label}:00" for bucket in buckets]

    def _mock_analytics(self) -> AnalyticsResponse:
        return AnalyticsResponse(
            total_violations=len(MOCK_VIOLATIONS),
            violations_by_hour=[CountBucket(label=str(item["hour"]), count=1) for item in MOCK_VIOLATIONS],
            violations_by_vehicle_type=[CountBucket(label="Car", count=3), CountBucket(label="Two Wheeler", count=1), CountBucket(label="Auto", count=1)],
            top_junctions=[CountBucket(label=str(item["junction"]), count=1) for item in MOCK_VIOLATIONS],
            top_police_stations=[CountBucket(label=str(item["station"]), count=1) for item in MOCK_VIOLATIONS],
            peak_periods=["08:00", "18:00", "19:00"],
        )

    def _mock_hotspots(self) -> list[HotspotResponse]:
        return [
            HotspotResponse(latitude=float(item["latitude"]), longitude=float(item["longitude"]), risk_score=float(item["risk"]))
            for item in MOCK_VIOLATIONS
        ]
