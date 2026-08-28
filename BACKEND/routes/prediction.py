from fastapi import APIRouter

router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


@router.get("/health")
def prediction_health():
    return {
        "status": "ok",
        "service": "prediction"
    }