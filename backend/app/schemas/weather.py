from datetime import datetime

from pydantic import BaseModel


class WeatherCreate(BaseModel):
    village_id: int
    temperature: float | None = None
    rainfall: float | None = None
    humidity: float | None = None
    recorded_at: datetime


class WeatherResponse(WeatherCreate):
    id: int