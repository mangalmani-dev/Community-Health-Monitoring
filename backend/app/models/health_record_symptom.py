from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class HealthRecordSymptom(Base):
    __tablename__ = "health_record_symptoms"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    health_record_id: Mapped[int] = mapped_column(
        ForeignKey("health_records.id"),
        nullable=False,
        index=True
    )

    symptom_id: Mapped[int] = mapped_column(
        ForeignKey("symptoms.id"),
        nullable=False,
        index=True
    )