from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.water_source import WaterSource
from app.schemas.water_source import (
    WaterSourceCreate,
    WaterSourceResponse
)


router = APIRouter(
    prefix="/water-sources",
    tags=["Water Sources"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=WaterSourceResponse)
def create_water_source(
    water_source: WaterSourceCreate,
    db: Session = Depends(get_db)
):
    new_water_source = WaterSource(
        village_id=water_source.village_id,
        name=water_source.name,
        source_type=water_source.source_type,
        location=water_source.location,
        status=water_source.status
    )

    db.add(new_water_source)
    db.commit()
    db.refresh(new_water_source)

    return new_water_source

@router.get("/", response_model=list[WaterSourceResponse])
def get_water_sources(
    db: Session = Depends(get_db)
):
    water_sources = db.query(WaterSource).all()

    return water_sources


@router.get("/{water_source_id}", response_model=WaterSourceResponse)
def get_water_source(
    water_source_id: int,
    db: Session = Depends(get_db)
):
    water_source = (
        db.query(WaterSource)
        .filter(WaterSource.id == water_source_id)
        .first()
    )

    if not water_source:
        raise HTTPException(
            status_code=404,
            detail="Water source not found"
        )

    return water_source

@router.put("/{water_source_id}", response_model=WaterSourceResponse)
def update_water_source(
    water_source_id: int,
    data: WaterSourceCreate,
    db: Session = Depends(get_db)
):
    water_source = (
        db.query(WaterSource)
        .filter(WaterSource.id == water_source_id)
        .first()
    )

    if not water_source:
        raise HTTPException(
            status_code=404,
            detail="Water source not found"
        )

    water_source.village_id = data.village_id
    water_source.name = data.name
    water_source.source_type = data.source_type
    water_source.location = data.location
    water_source.status = data.status

    db.commit()
    db.refresh(water_source)

    return water_source

@router.delete("/{water_source_id}")
def delete_water_source(
    water_source_id: int,
    db: Session = Depends(get_db)
):
    water_source = (
        db.query(WaterSource)
        .filter(WaterSource.id == water_source_id)
        .first()
    )

    if not water_source:
        raise HTTPException(
            status_code=404,
            detail="Water source not found"
        )

    db.delete(water_source)
    db.commit()

    return {
        "message": "Water source deleted successfully"
    }