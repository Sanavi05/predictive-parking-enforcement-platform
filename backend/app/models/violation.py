from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Violation(Base):
    __tablename__ = "violations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    h3_cell: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    junction_name: Mapped[str] = mapped_column(String(160), nullable=False)
    police_station: Mapped[str] = mapped_column(String(160), nullable=False)
    vehicle_type: Mapped[str] = mapped_column(String(80), nullable=False)
    violation_type: Mapped[str] = mapped_column(String(120), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
