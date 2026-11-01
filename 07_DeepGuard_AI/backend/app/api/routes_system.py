import os
import torch
from fastapi import APIRouter

from ..config import settings
from ..models.schemas import SystemStatus
from ..services.model_manager import model_manager
from ..services.history_service import history_service

router = APIRouter(tags=["System"])


@router.get("/health")
async def health_check():
    """Liveness probe verifying API service responsiveness."""
    return {
        "status": "HEALTHY",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


@router.get("/system/status", response_model=SystemStatus)
async def system_status_endpoint():
    """
    Returns runtime hardware acceleration (CPU vs CUDA), model readiness,
    and storage inventory metrics.
    """
    models = model_manager.list_models_status()
    ready = [m["model_name"] for m in models if m["is_ready"]]
    missing = [m["model_name"] for m in models if not m["is_ready"]]
    stats = history_service.get_dashboard_stats()

    cuda_avail = torch.cuda.is_available()
    cuda_name = torch.cuda.get_device_name(0) if cuda_avail else None

    # Count files in upload storage
    upload_count = len(list(settings.UPLOAD_DIR.glob("*"))) if settings.UPLOAD_DIR.exists() else 0

    return SystemStatus(
        status="ONLINE",
        version=settings.VERSION,
        device=str(model_manager.device),
        cuda_available=cuda_avail,
        cuda_device_name=cuda_name,
        total_analyses=stats["total_analyses"],
        models_ready=ready,
        models_missing=missing,
        storage_uploads_count=upload_count
    )
