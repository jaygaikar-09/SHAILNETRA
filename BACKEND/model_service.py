"""
model_service.py
------------------
Wraps the trained XGBoost risk-prediction pipeline.

Responsibilities:
  - Load the serialized model + scaler ONCE at startup (cached singleton),
    never per-request.
  - Preprocess incoming zone telemetry (scaling) to match training format.
  - Run inference and map the raw probability to a risk tier.
  - Provide a `train_and_save()` helper to (re)train the model from a
    historical/simulated CSV dataset, supporting the retraining feedback loop.

Risk tiers (per architecture spec):
  LOW    : 0-33
  MEDIUM : 34-66
  HIGH   : 67-100
"""

import os
import joblib
import numpy as np
import pandas as pd
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

from schemas import ZoneTelemetryInput, RiskTier

MODEL_DIR = os.getenv("MODEL_DIR", "app/ml_artifacts")
MODEL_PATH = os.path.join(MODEL_DIR, "xgb_rockfall_model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")

FEATURE_ORDER = [
    "rainfall_mm",
    "slope_angle_deg",
    "lateral_displacement_mm",
    "crack_width_mm",
    "ground_vibration_mm_s",
]


class ModelService:
    """Singleton-style holder for the loaded model + scaler."""

    _model: XGBClassifier | None = None
    _scaler: StandardScaler | None = None

    @classmethod
    def load(cls) -> None:
        """Load model & scaler from disk into memory. Call once at app startup."""
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            cls._model = joblib.load(MODEL_PATH)
            cls._scaler = joblib.load(SCALER_PATH)
        else:
            cls._model = None
            cls._scaler = None

    @classmethod
    def is_loaded(cls) -> bool:
        return cls._model is not None and cls._scaler is not None

    @classmethod
    def _to_feature_array(cls, payload: ZoneTelemetryInput) -> np.ndarray:
        row = [getattr(payload, f) for f in FEATURE_ORDER]
        return np.array(row, dtype=float).reshape(1, -1)

    @classmethod
    def _classify_tier(cls, score: float) -> RiskTier:
        if score >= 67:
            return RiskTier.HIGH
        if score >= 34:
            return RiskTier.MEDIUM
        return RiskTier.LOW

    @classmethod
    def predict(cls, payload: ZoneTelemetryInput) -> tuple[float, RiskTier]:
        """
        Run inference for a single zone reading.
        Returns (risk_score_0_to_100, risk_tier).
        Falls back to a deterministic heuristic if no trained model is
        loaded yet, so the endpoint stays usable during early development.
        """
        if not cls.is_loaded():
            return cls._heuristic_fallback(payload)

        features = cls._to_feature_array(payload)
        scaled = cls._scaler.transform(features)
        # probability of the "high risk" positive class
        proba = cls._model.predict_proba(scaled)[0][1]
        score = round(float(proba) * 100, 2)
        return score, cls._classify_tier(score)

    @classmethod
    def _heuristic_fallback(cls, payload: ZoneTelemetryInput) -> tuple[float, RiskTier]:
        """
        Simple weighted heuristic used only when no trained model artifact
        exists yet, so /predict never breaks during early integration.
        """
        score = (
            payload.rainfall_mm * 0.25
            + payload.slope_angle_deg * 0.3
            + payload.lateral_displacement_mm * 1.5
            + payload.crack_width_mm * 3.0
            + payload.ground_vibration_mm_s * 2.0
        )
        score = round(min(max(score, 0), 100), 2)
        return score, cls._classify_tier(score)

    @classmethod
    def train_and_save(cls, csv_path: str, target_col: str = "rockfall_event") -> dict:
        """
        Train an XGBoost classifier from a historical/simulated dataset and
        persist model + scaler to disk. Supports the continuous-improvement
        retraining loop described in the architecture doc.

        Expects a CSV with columns matching FEATURE_ORDER plus a binary
        target column (1 = rockfall event occurred, 0 = did not).
        """
        df = pd.read_csv(csv_path)
        df = df.dropna(subset=FEATURE_ORDER + [target_col])

        X = df[FEATURE_ORDER].values
        y = df[target_col].values

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)

        model = XGBClassifier(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.08,
            subsample=0.9,
            colsample_bytree=0.9,
            eval_metric="logloss",
            random_state=42,
        )
        model.fit(X_train_scaled, y_train)
        test_accuracy = model.score(X_test_scaled, y_test)

        os.makedirs(MODEL_DIR, exist_ok=True)
        joblib.dump(model, MODEL_PATH)
        joblib.dump(scaler, SCALER_PATH)

        cls._model = model
        cls._scaler = scaler

        return {"test_accuracy": round(float(test_accuracy), 4), "n_samples": len(df)}