from pydantic import BaseModel


class SymptomCreate(BaseModel):
    name: str


class SymptomResponse(SymptomCreate):
    id: int