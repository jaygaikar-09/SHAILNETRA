from fastapi import APIRouter

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


@router.get("/health")
def alerts_health():
    return {
        "status": "ok",
        "service": "alerts"
    }