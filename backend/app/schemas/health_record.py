from datetime import datetime

from pydantic import BaseModel


class HealthRecordCreate(BaseModel):
    patient_id: int
    recorded_by: int
    record_date: datetime
    diagnosis: str | None = None
    severity: str | None = None
    notes: str | None = None


class HealthRecordResponse(HealthRecordCreate):
    id: int
    created_at: datetime