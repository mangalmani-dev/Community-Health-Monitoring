from fastapi import APIRouter, Depends
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.village import Village
from app.schemas.village import VillageCreate, VillageResponse


router = APIRouter(
    prefix="/villages",
    tags=["Villages"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=VillageResponse)
def create_village(
    village: VillageCreate,
    db: Session = Depends(get_db)
):
    new_village = Village(
        name=village.name,
        district=village.district,
        state=village.state,
        pincode=village.pincode,
        latitude=village.latitude,
        longitude=village.longitude,
        population=village.population
    )

    db.add(new_village)
    db.commit()
    db.refresh(new_village)

    return new_village



@router.get("/", response_model=list[VillageResponse])
def get_villages(
    db: Session = Depends(get_db)
):
    villages = db.query(Village).all()

    return villages


@router.get("/{village_id}", response_model=VillageResponse)
def get_village(
    village_id: int,
    db: Session = Depends(get_db)
):
    village = db.query(Village).filter(Village.id == village_id).first()

    if not village:
        raise HTTPException(
            status_code=404,
            detail="Village not found"
        )

    return village

@router.put("/{village_id}", response_model=VillageResponse)
def update_village(
    village_id: int,
    village: VillageCreate,
    db: Session = Depends(get_db)
):
    existing_village = db.query(Village).filter(
        Village.id == village_id
    ).first()

    if not existing_village:
        raise HTTPException(
            status_code=404,
            detail="Village not found"
        )

    existing_village.name = village.name
    existing_village.district = village.district
    existing_village.state = village.state
    existing_village.pincode = village.pincode
    existing_village.latitude = village.latitude
    existing_village.longitude = village.longitude
    existing_village.population = village.population

    db.commit()
    db.refresh(existing_village)

    return existing_village


@router.delete("/{village_id}")
def delete_village(
    village_id: int,
    db: Session = Depends(get_db)
):
    village = db.query(Village).filter(
        Village.id == village_id
    ).first()

    if not village:
        raise HTTPException(
            status_code=404,
            detail="Village not found"
        )

    db.delete(village)
    db.commit()

    return {
        "message": "Village deleted successfully"
    }