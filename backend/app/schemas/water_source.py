from pydantic import BaseModel


class WaterSourceCreate(BaseModel):
    village_id: int
    name: str
    source_type: str
    location: str | None = None
    status: str


class WaterSourceResponse(WaterSourceCreate):
    id: int