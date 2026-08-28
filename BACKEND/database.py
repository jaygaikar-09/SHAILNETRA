"""
database.py
------------
Sets up:
  - PostgreSQL connection via SQLAlchemy (structured operational logs:
    predictions, alerts, zone history).
  - MongoDB connection via PyMongo (unstructured sensor/log storage).

Reads connection strings from environment variables (.env), with local
defaults so the API still boots during development without a real DB.
"""

import os
from dotenv import load_dotenv

from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

from pymongo import MongoClient

load_dotenv()

# ---------------------------------------------------------------------------
# PostgreSQL (structured operational logs)
# ---------------------------------------------------------------------------
POSTGRES_URL = os.getenv(
    "POSTGRES_URL",
    "postgresql://postgres:postgres@localhost:5432/rockfall_db",
)

engine = create_engine(POSTGRES_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class AlertLogModel(Base):
    """Table storing every alert ever triggered."""
    __tablename__ = "alert_logs"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String, index=True, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_tier = Column(String, nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class PredictionLogModel(Base):
    """Table storing every prediction made, for auditing / retraining."""
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(String, index=True, nullable=False)
    rainfall_mm = Column(Float)
    slope_angle_deg = Column(Float)
    lateral_displacement_mm = Column(Float)
    crack_width_mm = Column(Float)
    ground_vibration_mm_s = Column(Float)
    risk_score = Column(Float, nullable=False)
    risk_tier = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db() -> None:
    """Create tables if they don't already exist. Call once on startup."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """FastAPI dependency that yields a DB session and closes it afterward."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# MongoDB (unstructured sensor/log storage)
# ---------------------------------------------------------------------------
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "rockfall_sensors")

mongo_client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
mongo_db = mongo_client[MONGO_DB_NAME]

# Collection for raw/unstructured sensor telemetry dumps
sensor_collection = mongo_db["sensor_readings"]


def get_mongo_db():
    """FastAPI dependency that returns the Mongo database handle."""
    return mongo_db