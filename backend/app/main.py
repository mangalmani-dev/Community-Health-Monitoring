from fastapi import FastAPI
from app.routes.patient import router as patient_router
from app.routes.symptom import router as symptom_router
from app.routes.village import router as village_router
from app.routes.health_record import router as health_record_router
from app.routes.user import router as user_router
from app.routes.health_record_symptom import router as health_record_symptom_router
from app.routes.water_source import router as water_source_router
from app.routes.water_quality_report import router as water_quality_report_router
from app.routes.weather import router as weather_router
from app.routes.prediction import router as prediction_router
from app.routes.alert import router as alert_router
from app.routes.auth import router as auth_router


app = FastAPI(
    title="Smart Community Health Monitoring API",
    version="1.0.0"
)


app.include_router(village_router)
app.include_router(patient_router)
app.include_router(symptom_router)
app.include_router(health_record_router)
app.include_router(user_router)
app.include_router(health_record_symptom_router)
app.include_router(water_source_router)
app.include_router(water_quality_report_router)
app.include_router(weather_router)
app.include_router(prediction_router)
app.include_router(alert_router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "Smart Community Health Monitoring API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }





