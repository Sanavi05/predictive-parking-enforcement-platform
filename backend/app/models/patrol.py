from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class PatrolAssignment(Base):
    __tablename__ = "patrol_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    officer_id: Mapped[str] = mapped_column(String(80), nullable=False)
    assigned_h3_cell: Mapped[str] = mapped_column(String(32), nullable=False)
    priority_score: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(40), default="recommended", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
