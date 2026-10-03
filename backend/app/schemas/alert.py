from datetime import datetime

from pydantic import BaseModel


class AlertCreate(BaseModel):
    village_id: int
    prediction_id: int | None = None
    alert_type: str
    severity: str
    message: str
    status: str = "unread"


class AlertResponse(AlertCreate):
    id: int
    created_at: datetime
    resolved_at: datetime | None = None