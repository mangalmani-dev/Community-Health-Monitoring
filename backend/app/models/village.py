from datetime import datetime
from sqlalchemy import DateTime,Integer,Numeric,String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Village(Base):
    __tablename__="villages"

    id:Mapped[int]=mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    name:Mapped[str]=mapped_column(
        String(100),
        nullable=False

    )

    district:Mapped[str]=mapped_column(
        String(100),
        nullable=False
    )


    state:Mapped[str]=mapped_column(
        String(100),
        nullable=False
    )


    pincode: Mapped[str | None] = mapped_column(
        String(10),
        nullable=True
    )

    latitude: Mapped[float] = mapped_column(
        Numeric(10, 7),
        nullable=False
    )

    longitude: Mapped[float] = mapped_column(
        Numeric(10, 7),
        nullable=False
    )

    population: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )