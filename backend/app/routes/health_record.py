from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.health_record import HealthRecord
from app.schemas.health_record import HealthRecordCreate, HealthRecordResponse


router = APIRouter(
    prefix="/health-records",
    tags=["Health Records"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()



@router.post("/", response_model=HealthRecordResponse)
def create_health_record(
    health_record: HealthRecordCreate,
    db: Session = Depends(get_db)
):
    new_health_record = HealthRecord(
        patient_id=health_record.patient_id,
        recorded_by=health_record.recorded_by,
        record_date=health_record.record_date,
        diagnosis=health_record.diagnosis,
        severity=health_record.severity,
        notes=health_record.notes
    )

    db.add(new_health_record)
    db.commit()
    db.refresh(new_health_record)

    return new_health_record