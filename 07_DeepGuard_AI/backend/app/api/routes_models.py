from typing import List
from fastapi import APIRouter, HTTPException

from ..config import settings
from ..models.schemas import ModelInfo
from ..services.model_manager import model_manager
from ..core.exceptions import ModelNotFoundError

router = APIRouter(prefix="/models", tags=["Models"])


@router.get("", response_model=List[ModelInfo])
async def list_models_endpoint():
    """
    Returns all supported forensic detection architectures and their local checkpoint readiness.
    If checkpoints are missing, detailed Colab setup instructions are included.
    """
    return model_manager.list_models_status()


@router.get("/{model_name}", response_model=ModelInfo)
async def get_model_endpoint(model_name: str):
    """
    Returns specification and checkpoint availability for a specific model.
    """
    all_models = model_manager.list_models_status()
    for m in all_models:
        if m["model_name"] == model_name:
            return m
    raise HTTPException(status_code=404, detail=f"Model '{model_name}' not found.")
