from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.alert import Alert
from app.schemas.alert import (
    AlertCreate,
    AlertResponse
)


router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=AlertResponse)
def create_alert(
    alert: AlertCreate,
    db: Session = Depends(get_db)
):
    new_alert = Alert(
        village_id=alert.village_id,
        prediction_id=alert.prediction_id,
        alert_type=alert.alert_type,
        severity=alert.severity,
        message=alert.message,
        status=alert.status
    )

    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)

    return new_alert

@router.get("/", response_model=list[AlertResponse])
def get_alerts(
    db: Session = Depends(get_db)
):
    alerts = db.query(Alert).all()

    return alerts


@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    return alert


@router.put("/{alert_id}", response_model=AlertResponse)
def update_alert(
    alert_id: int,
    data: AlertCreate,
    db: Session = Depends(get_db)
):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    alert.village_id = data.village_id
    alert.prediction_id = data.prediction_id
    alert.alert_type = data.alert_type
    alert.severity = data.severity
    alert.message = data.message
    alert.status = data.status

    db.commit()
    db.refresh(alert)

    return alert

@router.delete("/{alert_id}")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):
    alert = (
        db.query(Alert)
        .filter(Alert.id == alert_id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found"
        )

    db.delete(alert)
    db.commit()

    return {
        "message": "Alert deleted successfully"
    }