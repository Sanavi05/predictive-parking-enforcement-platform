from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class HotspotPrediction(Base):
    __tablename__ = "hotspot_predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    h3_cell: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    prediction_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    predicted_count: Mapped[int] = mapped_column(Integer, nullable=False)
    impact_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(40), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
