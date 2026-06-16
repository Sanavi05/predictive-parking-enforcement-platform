from fastapi import APIRouter

from app.schemas.response import PatrolRecommendation
from app.services.patrol_optimizer import PatrolOptimizer

router = APIRouter()


@router.get("/patrol/recommendations", response_model=list[PatrolRecommendation])
def get_patrol_recommendations() -> list[PatrolRecommendation]:
    return PatrolOptimizer().recommend()
