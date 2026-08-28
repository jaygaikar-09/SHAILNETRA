"""
schemas.py
-----------
Pydantic models used for request validation and response formatting
across the Rockfall Prediction API.
"""

from enum import Enum
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class RiskTier(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ZoneTelemetryInput(BaseModel):
    """
    Incoming geotechnical telemetry for a single mine zone.
    This is the payload the frontend / sensor gateway sends to POST /predict.
    """
    zone_id: str = Field(..., description="Unique identifier for the mine zone, e.g. 'ZONE-04'")
    rainfall_mm: float = Field(..., ge=0, description="Rainfall in mm over the observation window")
    slope_angle_deg: float = Field(..., ge=0, le=90, description="Slope angle in degrees")
    lateral_displacement_mm: float = Field(..., ge=0, description="Lateral displacement in mm")
    crack_width_mm: float = Field(..., ge=0, description="Crack width in mm")
    ground_vibration_mm_s: float = Field(..., ge=0, description="Ground vibration (PPV) in mm/s")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "zone_id": "ZONE-04",
                "rainfall_mm": 42.5,
                "slope_angle_deg": 38.2,
                "lateral_displacement_mm": 12.7,
                "crack_width_mm": 3.4,
                "ground_vibration_mm_s": 5.1,
            }
        }
    )


class PredictionResponse(BaseModel):
    """
    Structured JSON output returned by POST /predict.
    """
    zone_id: str
    risk_score: float = Field(..., ge=0, le=100, description="Zone-wise risk probability, 0-100")
    risk_tier: RiskTier
    alert_triggered: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "zone_id": "ZONE-04",
                "risk_score": 78.3,
                "risk_tier": "HIGH",
                "alert_triggered": True,
                "timestamp": "2026-08-25T10:15:00Z",
            }
        }
    )


class AlertLog(BaseModel):
    """
    Record persisted whenever an alert is triggered (used by the
    PostgreSQL operational log table).
    """
    zone_id: str
    risk_score: float
    risk_tier: RiskTier
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HealthResponse(BaseModel):
    model_loaded: bool

    model_config = {
        "protected_namespaces": ()
    }