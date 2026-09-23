from fastapi import FastAPI
from app.routes.patient import router as patient_router

from app.routes.village import router as village_router


app = FastAPI(
    title="Smart Community Health Monitoring API",
    version="1.0.0"
)


app.include_router(village_router)
app.include_router(patient_router)


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
