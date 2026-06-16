from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.response import HotspotResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/hotspots", response_model=list[HotspotResponse])
def get_hotspots(db: Session = Depends(get_db)) -> list[HotspotResponse]:
    return AnalyticsService(db).get_hotspot_heatmap()
