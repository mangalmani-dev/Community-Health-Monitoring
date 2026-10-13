from enum import Enum

from pydantic import BaseModel


class UserRole(str, Enum):
    ASHA_WORKER = "ASHA Worker"
    MEDICAL_OFFICER = "Medical Officer"
    DISTRICT_HEALTH_OFFICER = "District Health Officer"


class UserCreate(BaseModel):
    name: str
    email: str
    phone: str | None = None
    password: str
    role: UserRole                  
    village_id: int | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None = None
    role: str
    village_id: int | None = None
    is_active: bool