from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.symptom import Symptom
from app.schemas.symptom import SymptomCreate, SymptomResponse


router = APIRouter(
    prefix="/symptoms",
    tags=["Symptoms"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()



@router.post("/", response_model=SymptomResponse)
def create_symptom(
    symptom: SymptomCreate,
    db: Session = Depends(get_db)
):
    new_symptom = Symptom(
        name=symptom.name
    )

    db.add(new_symptom)
    db.commit()
    db.refresh(new_symptom)

    return new_symptom

@router.get("/", response_model=list[SymptomResponse])
def get_symptoms(
    db: Session = Depends(get_db)
):
    symptoms = db.query(Symptom).all()

    return symptoms



@router.get("/{symptom_id}", response_model=SymptomResponse)
def get_symptom(
    symptom_id: int,
    db: Session = Depends(get_db)
):
    symptom = db.query(Symptom).filter(
        Symptom.id == symptom_id
    ).first()

    if not symptom:
        raise HTTPException(
            status_code=404,
            detail="Symptom not found"
        )

    return symptom

@router.put("/{symptom_id}", response_model=SymptomResponse)
def update_symptom(
    symptom_id: int,
    symptom: SymptomCreate,
    db: Session = Depends(get_db)
):
    existing_symptom = db.query(Symptom).filter(
        Symptom.id == symptom_id
    ).first()

    if not existing_symptom:
        raise HTTPException(
            status_code=404,
            detail="Symptom not found"
        )

    existing_symptom.name = symptom.name

    db.commit()
    db.refresh(existing_symptom)

    return existing_symptom

@router.delete("/{symptom_id}")
def delete_symptom(
    symptom_id: int,
    db: Session = Depends(get_db)
):
    symptom = db.query(Symptom).filter(
        Symptom.id == symptom_id
    ).first()

    if not symptom:
        raise HTTPException(
            status_code=404,
            detail="Symptom not found"
        )

    db.delete(symptom)
    db.commit()

    return {
        "message": "Symptom deleted successfully"
    }