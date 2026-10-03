from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientResponse


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=PatientResponse)
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db)
):
    new_patient = Patient(
        village_id=patient.village_id,
        name=patient.name,
        age=patient.age,
        gender=patient.gender,
        contact_number=patient.contact_number
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return new_patient



@router.get("/", response_model=list[PatientResponse])
def get_patients(
    db: Session = Depends(get_db)
):
    patients = db.query(Patient).all()

    return patients


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    return patient

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    patient: PatientCreate,
    db: Session = Depends(get_db)
):
    existing_patient = db.query(Patient).filter(
        Patient.id == patient_id
    ).first()

    if not existing_patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    existing_patient.village_id = patient.village_id
    existing_patient.name = patient.name
    existing_patient.age = patient.age
    existing_patient.gender = patient.gender
    existing_patient.contact_number = patient.contact_number

    db.commit()
    db.refresh(existing_patient)

    return existing_patient

@router.get("/village/{village_id}", response_model=list[PatientResponse])
def get_patients_by_village(
    village_id: int,
    db: Session = Depends(get_db)
):
    patients = db.query(Patient).filter(
        Patient.village_id == village_id
    ).all()

    if not patients:
        raise HTTPException(
            status_code=404,
            detail="No patients found for this village"
        )

    return patients


@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(
        Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    db.delete(patient)
    db.commit()

    return {
        "message": "Patient deleted successfully"
    }