from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.roles import require_role
from app.db.database import SessionLocal
from app.models.health_record import HealthRecord
from app.schemas.health_record import (
    HealthRecordCreate,
    HealthRecordResponse,
    HealthRecordUpdate
)


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


# CREATE HEALTH RECORD
@router.post("/", response_model=HealthRecordResponse)
def create_health_record(
    health_record: HealthRecordCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_health_record = HealthRecord(
        patient_id=health_record.patient_id,
        recorded_by=current_user.id,
        record_date=health_record.record_date,
        diagnosis=health_record.diagnosis,
        severity=health_record.severity,
        notes=health_record.notes
    )

    db.add(new_health_record)
    db.commit()
    db.refresh(new_health_record)

    return new_health_record


# GET ALL HEALTH RECORDS
@router.get("/", response_model=list[HealthRecordResponse])
def get_health_records(
    db: Session = Depends(get_db),
    current_user=Depends(
        require_role(
            "Medical Officer",
            "District Health Officer"
        )
    )
):
    health_records = (
        db.query(HealthRecord)
        .all()
    )

    return health_records


# GET SINGLE HEALTH RECORD
@router.get("/{record_id}", response_model=HealthRecordResponse)
def get_health_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    health_record = (
        db.query(HealthRecord)
        .filter(HealthRecord.id == record_id)
        .first()
    )

    if not health_record:
        raise HTTPException(
            status_code=404,
            detail="Health record not found"
        )

    return health_record


# GET PATIENT HEALTH RECORDS
@router.get(
    "/patient/{patient_id}",
    response_model=list[HealthRecordResponse]
)
def get_patient_health_records(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    health_records = (
        db.query(HealthRecord)
        .filter(HealthRecord.patient_id == patient_id)
        .all()
    )

    return health_records


# UPDATE HEALTH RECORD
@router.put("/{record_id}", response_model=HealthRecordResponse)
def update_health_record(
    record_id: int,
    data: HealthRecordUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    health_record = (
        db.query(HealthRecord)
        .filter(HealthRecord.id == record_id)
        .first()
    )

    if not health_record:
        raise HTTPException(
            status_code=404,
            detail="Health record not found"
        )

    if data.diagnosis is not None:
        health_record.diagnosis = data.diagnosis

    if data.severity is not None:
        health_record.severity = data.severity

    if data.notes is not None:
        health_record.notes = data.notes

    db.commit()
    db.refresh(health_record)

    return health_record


# DELETE HEALTH RECORD
@router.delete("/{record_id}")
def delete_health_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    health_record = (
        db.query(HealthRecord)
        .filter(HealthRecord.id == record_id)
        .first()
    )

    if not health_record:
        raise HTTPException(
            status_code=404,
            detail="Health record not found"
        )

    db.delete(health_record)
    db.commit()

    return {
        "message": "Health record deleted successfully"
    }