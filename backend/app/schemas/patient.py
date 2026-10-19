from pydantic import BaseModel


class PatientCreate(BaseModel):
    village_id: int
    name: str
    age: int
    gender: str
    contact_number: str | None = None
    diagnosis: str | None = None
    severity: str | None = None
    notes: str | None = None


class PatientResponse(PatientCreate):
    id: int