import torch
from fastapi import APIRouter
from app.config import settings
from app.services.detector_service import detector_service

router = APIRouter()

@router.get("/status")
def get_system_status():
    cuda_available = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if cuda_available else "CPU (Standard Inference)"
    
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "device": device_name,
        "cuda_available": cuda_available,
        "active_model_id": detector_service.active_model_id,
        "active_model_name": detector_service.model_configs[detector_service.active_model_id]["name"],
        "supported_classes": settings.CLASS_NAMES,
        "thresholds": {
            "default_confidence": settings.DEFAULT_CONF_THRESHOLD,
            "default_iou": settings.DEFAULT_IOU_THRESHOLD
        }
    }

@router.get("/models")
def list_available_models():
    models_info = []
    for mid, cfg in detector_service.model_configs.items():
        models_info.append({
            "id": mid,
            "name": cfg["name"],
            "type": cfg["type"],
            "is_champion": (mid == settings.DEFAULT_MODEL_ID),
            "mAP50": cfg["mAP50"],
            "mAP50_95": cfg["mAP50_95"],
            "precision": cfg["precision"],
            "recall": cfg["recall"],
            "description": (
                "Experiment 3 Champion: Highest mAP50-95 (55.85%) and superior spatial localization accuracy."
                if mid == "v3" else
                "Experiment 2: Fast lightweight nano model fine-tuned for high precision (92.13%)."
                if mid == "v2" else
                "Experiment 1: Baseline YOLOv8n detector with solid 91.38% mAP50."
            )
        })
    return {"models": models_info, "recommended_model": settings.DEFAULT_MODEL_ID}
