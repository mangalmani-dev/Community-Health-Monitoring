from pydantic import BaseModel


class HealthRecordSymptomCreate(BaseModel):
    health_record_id: int
    symptom_id: int


class HealthRecordSymptomResponse(HealthRecordSymptomCreate):
    id: int