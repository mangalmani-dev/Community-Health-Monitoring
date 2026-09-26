from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.health_record_symptom import HealthRecordSymptom
from app.schemas.health_record_symptom import (
    HealthRecordSymptomCreate,
    HealthRecordSymptomResponse
)

router = APIRouter(
    prefix="/health-record-symptoms",
    tags=["Health Record Symptoms"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=HealthRecordSymptomResponse)
def create_health_record_symptom(
    data: HealthRecordSymptomCreate,
    db: Session = Depends(get_db)
):
    new_record = HealthRecordSymptom(
        health_record_id=data.health_record_id,
        symptom_id=data.symptom_id
    )

    db.add(new_record)
    db.commit()
    db.refresh(new_record)

    return new_record


