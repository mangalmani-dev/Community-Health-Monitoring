from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.prediction import Prediction
from app.schemas.prediction import (
    PredictionCreate,
    PredictionResponse
)


router = APIRouter(
    prefix="/predictions",
    tags=["Predictions"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=PredictionResponse)
def create_prediction(
    prediction: PredictionCreate,
    db: Session = Depends(get_db)
):
    new_prediction = Prediction(
        village_id=prediction.village_id,
        risk_score=prediction.risk_score,
        risk_level=prediction.risk_level,
        predicted_at=prediction.predicted_at
    )

    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)

    return new_prediction


@router.get("/", response_model=list[PredictionResponse])
def get_predictions(
    db: Session = Depends(get_db)
):
    predictions = db.query(Prediction).all()

    return predictions


@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db)
):
    prediction = (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id)
        .first()
    )

    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found"
        )

    return prediction


@router.put("/{prediction_id}", response_model=PredictionResponse)
def update_prediction(
    prediction_id: int,
    data: PredictionCreate,
    db: Session = Depends(get_db)
):
    prediction = (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id)
        .first()
    )

    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found"
        )

    prediction.village_id = data.village_id
    prediction.risk_score = data.risk_score
    prediction.risk_level = data.risk_level
    prediction.predicted_at = data.predicted_at

    db.commit()
    db.refresh(prediction)

    return prediction

@router.delete("/{prediction_id}")
def delete_prediction(
    prediction_id: int,
    db: Session = Depends(get_db)
):
    prediction = (
        db.query(Prediction)
        .filter(Prediction.id == prediction_id)
        .first()
    )

    if not prediction:
        raise HTTPException(
            status_code=404,
            detail="Prediction not found"
        )

    db.delete(prediction)
    db.commit()

    return {
        "message": "Prediction deleted successfully"
    }