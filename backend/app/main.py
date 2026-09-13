from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.db.database import create_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield

app = FastAPI(
    title="Smart Community Health Monitoring API",
    version="1.0.0",
    lifespan=lifespan
)

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