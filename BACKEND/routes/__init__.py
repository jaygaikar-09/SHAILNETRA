from fastapi import APIRouter

from .prediction import router as prediction_router
from .alerts import router as alerts_router
from .zones import router as zones_router

router = APIRouter()

router.include_router(prediction_router)
router.include_router(alerts_router)
router.include_router(zones_router)