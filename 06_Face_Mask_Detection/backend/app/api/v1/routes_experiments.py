from fastapi import APIRouter
from app.config import settings

router = APIRouter()

EXPERIMENT_DATA = {
    "v1": {
        "id": "v1",
        "title": "Experiment 1: YOLOv8n Baseline",
        "model": "YOLOv8n",
        "architecture": "YOLOv8 Nano (Pretrained COCO -> Custom Transfer)",
        "epochs": 50,
        "batch_size": 16,
        "imgsz": 640,
        "parameters": "3.2 Million",
        "weights_size_mb": 6.25,
        "best_epoch": 38,
        "metrics": {
            "mAP50": 0.9138,
            "mAP50_95": 0.5298,
            "precision": 0.8686,
            "recall": 0.8515,
            "box_loss": 1.2518,
            "cls_loss": 0.6225,
            "dfl_loss": 1.2363
        },
        "strengths": [
            "Fastest inference latency (~12ms on CPU)",
            "Strong initial baseline mAP50 of 91.38%",
            "Very small footprint (6.25 MB)"
        ],
        "weaknesses": [
            "Lower precision on edge cases with partial occlusions",
            "Slightly lower mAP50-95 boundary accuracy (52.98%)"
        ],
        "verdict": "Solid baseline, but exceeded in bounding box tightness by V3."
    },
    "v2": {
        "id": "v2",
        "title": "Experiment 2: YOLOv26n (Enhanced Nano)",
        "model": "YOLOv26n",
        "architecture": "YOLO Nano Custom Architecture with DFL & Auto-Augment",
        "epochs": 50,
        "batch_size": 16,
        "imgsz": 640,
        "parameters": "3.1 Million",
        "weights_size_mb": 5.45,
        "best_epoch": 33,
        "metrics": {
            "mAP50": 0.9046,
            "mAP50_95": 0.5363,
            "precision": 0.9213,
            "recall": 0.8063,
            "box_loss": 1.3437,
            "cls_loss": 0.6797,
            "l1_loss": 0.0116
        },
        "strengths": [
            "Highest precision among all models (92.13%)",
            "Lowest false positive rate for mask alerts",
            "Ultra compact model file (5.45 MB)"
        ],
        "weaknesses": [
            "Slight drop in recall (80.63%) - occasionally misses small distant faces"
        ],
        "verdict": "Great for low-false-alarm scenarios, but lower recall than V3."
    },
    "v3": {
        "id": "v3",
        "title": "Experiment 3: YOLOv26s Champion",
        "model": "YOLOv26s",
        "architecture": "YOLO Small Architecture with Deep Feature Pyramid & DFL",
        "epochs": 50,
        "batch_size": 16,
        "imgsz": 640,
        "parameters": "11.2 Million",
        "weights_size_mb": 20.31,
        "best_epoch": 31,
        "metrics": {
            "mAP50": 0.9044,
            "mAP50_95": 0.5585,
            "precision": 0.9150,
            "recall": 0.8482,
            "box_loss": 1.3450,
            "cls_loss": 0.5384,
            "l1_loss": 0.0109
        },
        "strengths": [
            "Highest mAP50-95 in the entire benchmark (55.85%)",
            "Superb balance between high Precision (91.50%) and high Recall (84.82%)",
            "Lowest validation classification loss (0.5384)",
            "Robust against multi-face crowds, angle variations, and shadows"
        ],
        "weaknesses": [
            "Slightly larger model size (20.31 MB vs 5.45 MB)",
            "Marginally higher compute requirement"
        ],
        "verdict": "🏆 CHAMPION MODEL. Selected for final production deployment due to superior overall detection accuracy and tightest bounding boxes."
    }
}

@router.get("/comparison")
def get_experiment_comparison():
    return {
        "champion_id": "v3",
        "summary": "Three separate fine-tuning experiments were conducted on the custom face mask dataset across 50 epochs each. YOLOv26s achieved the highest mAP50-95 (55.85%) and the most consistent precision/recall balance.",
        "experiments": list(EXPERIMENT_DATA.values())
    }

@router.get("/{model_id}")
def get_experiment_details(model_id: str):
    if model_id not in EXPERIMENT_DATA:
        return {"error": f"Experiment {model_id} not found", "available": list(EXPERIMENT_DATA.keys())}
    return EXPERIMENT_DATA[model_id]
