from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str
    email: str
    phone: str | None = None
    password: str
    role: str
    village_id: int | None = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None = None
    role: str
    village_id: int | None = None
    is_active: bool