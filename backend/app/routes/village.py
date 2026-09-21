from fastapi import APIRouter, Depends
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