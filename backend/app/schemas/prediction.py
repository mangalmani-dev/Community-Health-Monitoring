from datetime import datetime

from pydantic import BaseModel


class PredictionCreate(BaseModel):
    village_id: int
    risk_score: float
    risk_level: str
    predicted_at: datetime


class PredictionResponse(PredictionCreate):
    id: int