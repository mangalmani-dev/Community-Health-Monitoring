from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.water_quality_report import WaterQualityReport
from app.schemas.water_quality_report import (
    WaterQualityReportCreate,
    WaterQualityReportResponse
)


router = APIRouter(
    prefix="/water-quality-reports",
    tags=["Water Quality Reports"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=WaterQualityReportResponse)
def create_water_quality_report(
    report: WaterQualityReportCreate,
    db: Session = Depends(get_db)
):
    new_report = WaterQualityReport(
        water_source_id=report.water_source_id,
        ph=report.ph,
        turbidity=report.turbidity,
        contamination_status=report.contamination_status,
        tested_by=report.tested_by,
        tested_at=report.tested_at
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return new_report


@router.get("/", response_model=list[WaterQualityReportResponse])
def get_water_quality_reports(
    db: Session = Depends(get_db)
):
    reports = db.query(WaterQualityReport).all()

    return reports

@router.get("/{report_id}", response_model=WaterQualityReportResponse)
def get_water_quality_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    report = (
        db.query(WaterQualityReport)
        .filter(WaterQualityReport.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Water quality report not found"
        )

    return report
@router.put("/{report_id}", response_model=WaterQualityReportResponse)
def update_water_quality_report(
    report_id: int,
    data: WaterQualityReportCreate,
    db: Session = Depends(get_db)
):
    report = (
        db.query(WaterQualityReport)
        .filter(WaterQualityReport.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Water quality report not found"
        )

    report.water_source_id = data.water_source_id
    report.ph = data.ph
    report.turbidity = data.turbidity
    report.contamination_status = data.contamination_status
    report.tested_by = data.tested_by
    report.tested_at = data.tested_at

    db.commit()
    db.refresh(report)

    return report

@router.delete("/{report_id}")
def delete_water_quality_report(
    report_id: int,
    db: Session = Depends(get_db)
):
    report = (
        db.query(WaterQualityReport)
        .filter(WaterQualityReport.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Water quality report not found"
        )

    db.delete(report)
    db.commit()

    return {
        "message": "Water quality report deleted successfully"
    }