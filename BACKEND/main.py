"""
main.py
--------
FastAPI application entrypoint for the SHAILNETRA Rockfall Prediction API.

Run locally with:
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from model_service import ModelService
from routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    init_db()               # create Postgres tables if they don't exist
    ModelService.load()     # load XGBoost model + scaler once, cache in memory
    yield
    # --- Shutdown (nothing to clean up currently) ---


app = FastAPI(
    title="SHAILNETRA - Rockfall Prediction API",
    description="AI-based rockfall prediction and alert system for open-pit mines.",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the React frontend (dev + deployed) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your actual frontend domain(s) in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/", tags=["System"])
def root():
    return {"message": "SHAILNETRA Rockfall Prediction API is running."}