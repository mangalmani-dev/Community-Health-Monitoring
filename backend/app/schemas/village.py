from pydantic import BaseModel


class VillageCreate(BaseModel):
    name: str
    district: str
    state: str
    pincode: str | None = None
    latitude: float
    longitude: float
    population: int | None = None


class VillageResponse(VillageCreate):
    id: int