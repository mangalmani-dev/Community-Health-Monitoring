import os
from app.db.base import Base
from app.models.village import Village
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from app.models.patient import Patient
from app.models.symptom import Symptom
from app.models.water_source import WaterSource
from app.models.water_quality_report import WaterQualityReport
from app.models.weather import Weather
from app.models.prediction import Prediction
from app.models.alert import Alert
from app.models.health_record import HealthRecord
from app.models.user import User
from app.models.health_record_symptom import HealthRecordSymptom

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

engine = create_engine(
    DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg://"
    )
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def test_database_connection():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return result.scalar()



def create_tables():
    Base.metadata.create_all(bind=engine)