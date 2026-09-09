from fastapi import FastAPI

app = FastAPI(
    title="Smart Community Health Monitoring API",
    version="1.0.0"
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