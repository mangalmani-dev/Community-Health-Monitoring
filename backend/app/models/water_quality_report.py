from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class WaterQualityReport(Base):
    __tablename__ = "water_quality_reports"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    water_source_id: Mapped[int] = mapped_column(
        ForeignKey("water_sources.id"),
        nullable=False,
        index=True
    )

    ph: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    turbidity: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )
    h2s_test_result: Mapped[str | None] = mapped_column(
            String(20),
            nullable=True
    )
    contamination_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    tested_by: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    tested_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )