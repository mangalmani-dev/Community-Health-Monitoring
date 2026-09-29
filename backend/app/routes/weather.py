from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.weather import Weather
from app.schemas.weather import (
    WeatherCreate,
    WeatherResponse
)


router = APIRouter(
    prefix="/weather",
    tags=["Weather"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=WeatherResponse)
def create_weather(
    weather: WeatherCreate,
    db: Session = Depends(get_db)
):
    new_weather = Weather(
        village_id=weather.village_id,
        temperature=weather.temperature,
        rainfall=weather.rainfall,
        humidity=weather.humidity,
        recorded_at=weather.recorded_at
    )

    db.add(new_weather)
    db.commit()
    db.refresh(new_weather)

    return new_weather

@router.get("/", response_model=list[WeatherResponse])
def get_weather_records(
    db: Session = Depends(get_db)
):
    weather_records = db.query(Weather).all()

    return weather_records


@router.get("/{weather_id}", response_model=WeatherResponse)
def get_weather(
    weather_id: int,
    db: Session = Depends(get_db)
):
    weather = (
        db.query(Weather)
        .filter(Weather.id == weather_id)
        .first()
    )

    if not weather:
        raise HTTPException(
            status_code=404,
            detail="Weather record not found"
        )

    return weather

@router.put("/{weather_id}", response_model=WeatherResponse)
def update_weather(
    weather_id: int,
    data: WeatherCreate,
    db: Session = Depends(get_db)
):
    weather = (
        db.query(Weather)
        .filter(Weather.id == weather_id)
        .first()
    )

    if not weather:
        raise HTTPException(
            status_code=404,
            detail="Weather record not found"
        )

    weather.village_id = data.village_id
    weather.temperature = data.temperature
    weather.rainfall = data.rainfall
    weather.humidity = data.humidity
    weather.recorded_at = data.recorded_at

    db.commit()
    db.refresh(weather)

    return weather

@router.delete("/{weather_id}")
def delete_weather(
    weather_id: int,
    db: Session = Depends(get_db)
):
    weather = (
        db.query(Weather)
        .filter(Weather.id == weather_id)
        .first()
    )

    if not weather:
        raise HTTPException(
            status_code=404,
            detail="Weather record not found"
        )

    db.delete(weather)
    db.commit()

    return {
        "message": "Weather record deleted successfully"
    }