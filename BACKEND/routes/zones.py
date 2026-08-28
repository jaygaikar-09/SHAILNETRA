from fastapi import APIRouter

router = APIRouter(
    prefix="/zones",
    tags=["Zones"]
)


@router.get("/health")
def zones_health():
    return {
        "status": "ok",
        "service": "zones"
    }