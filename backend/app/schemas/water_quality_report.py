from datetime import datetime

from pydantic import BaseModel


class WaterQualityReportCreate(BaseModel):
    water_source_id: int
    ph: float | None = None
    turbidity: float | None = None
    contamination_status: str
    tested_by: str | None = None
    tested_at: datetime


class WaterQualityReportResponse(WaterQualityReportCreate):
    id: int