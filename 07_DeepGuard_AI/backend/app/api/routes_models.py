from typing import List
from fastapi import APIRouter, HTTPException

from ..config import settings
from ..models.schemas import ModelInfo, ModelBenchmarkItem
from ..services.model_manager import model_manager
from ..core.exceptions import ModelNotFoundError

router = APIRouter(prefix="/models", tags=["Models"])

BENCHMARK_DATA: List[ModelBenchmarkItem] = [
    ModelBenchmarkItem(
        model_name="efficientnet_b4",
        display_name="EfficientNet-B4 Deepfake Detector (Champion)",
        architecture="efficientnet_b4",
        input_size=[380, 380],
        weights_size_mb=70.97,
        test_accuracy=0.97,
        macro_precision=0.97,
        macro_recall=0.97,
        macro_f1=0.97,
        roc_auc=0.9968,
        fake_recall=0.9821,
        real_precision=0.9817,
        val_loss_min=0.075,
        total_test_samples=8938,
        false_positives=176,
        false_negatives=80,
        metrics_image_url="/assets/efficientnet_b4_metrics.png",
        roc_image_url="/assets/efficientnet_b4_roc.png",
        is_champion=True,
        summary="Highest performing deepfake forensic model. Achieves 97% test accuracy and 0.9968 ROC-AUC with only 80 deepfakes missed out of 4,469 test samples. Selected as the production champion."
    ),
    ModelBenchmarkItem(
        model_name="xception",
        display_name="XceptionNet Deepfake Detector",
        architecture="xception",
        input_size=[299, 299],
        weights_size_mb=83.55,
        test_accuracy=0.93,
        macro_precision=0.93,
        macro_recall=0.93,
        macro_f1=0.93,
        roc_auc=0.9867,
        fake_recall=0.9530,
        real_precision=0.9509,
        val_loss_min=0.155,
        total_test_samples=8938,
        false_positives=399,
        false_negatives=210,
        metrics_image_url="/assets/xception_metrics.png",
        roc_image_url="/assets/xception_roc.png",
        is_champion=False,
        summary="Classical benchmark architecture for face manipulation detection based on depthwise separable convolutions. Strong detection baseline with 93% accuracy."
    ),
    ModelBenchmarkItem(
        model_name="efficientnet_b0",
        display_name="EfficientNet-B0 Deepfake Detector",
        architecture="efficientnet_b0",
        input_size=[224, 224],
        weights_size_mb=16.34,
        test_accuracy=0.92,
        macro_precision=0.92,
        macro_recall=0.92,
        macro_f1=0.92,
        roc_auc=0.9795,
        fake_recall=0.9293,
        real_precision=0.9274,
        val_loss_min=0.175,
        total_test_samples=8938,
        false_positives=434,
        false_negatives=316,
        metrics_image_url="/assets/efficientnet_b0_metrics.png",
        roc_image_url="/assets/efficientnet_b0_roc.png",
        is_champion=False,
        summary="Ultra-compact mobile-friendly baseline. Smallest model footprint (16.34 MB) with fast inference times and solid 92% accuracy."
    )
]


@router.get("", response_model=List[ModelInfo])
async def list_models_endpoint():
    """
    Returns all supported forensic detection architectures and their local checkpoint readiness.
    If checkpoints are missing, detailed Colab setup instructions are included.
    """
    return model_manager.list_models_status()


@router.get("/benchmarks", response_model=List[ModelBenchmarkItem])
async def get_benchmarks_endpoint():
    """
    Returns comparative evaluation metrics, confusion matrices, and ROC curves
    across all 3 experimental models (B0, Xception, B4).
    """
    return BENCHMARK_DATA


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
