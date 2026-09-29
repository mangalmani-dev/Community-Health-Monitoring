from datetime import datetime

from pydantic import BaseModel


class HealthRecordCreate(BaseModel):
    patient_id: int
    record_date: datetime
    diagnosis: str | None = None
    severity: str | None = None
    notes: str | None = None


class HealthRecordResponse(HealthRecordCreate):
    id: int
    recorded_by: int
    created_at: datetime


class HealthRecordUpdate(BaseModel):
    diagnosis: str | None = None
    severity: str | None = None
    notes: str | None = None