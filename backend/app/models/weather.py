from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Weather(Base):
    __tablename__ = "weather"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    village_id: Mapped[int] = mapped_column(
        ForeignKey("villages.id"),
        nullable=False,
        index=True
    )

    temperature: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    rainfall: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    humidity: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )