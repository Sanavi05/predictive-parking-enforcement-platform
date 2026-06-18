from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.response import AnalyticsResponse, DashboardSummaryResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)) -> AnalyticsResponse:
    return AnalyticsService(db).get_historical_analytics()


@router.get("/dashboard-summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)) -> DashboardSummaryResponse:
    return AnalyticsService(db).get_dashboard_summary()
