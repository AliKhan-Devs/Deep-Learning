import time
from typing import Dict, Any, List, Tuple
import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve,
    precision_recall_curve
)


def compute_classification_metrics(
    y_true: List[int],
    y_prob: List[float],
    threshold: float = 0.50
) -> Dict[str, Any]:
    """
    Computes complete statistical forensic evaluation metrics.

    Args:
        y_true: Binary ground truth labels (0: REAL, 1: FAKE).
        y_prob: Predicted probability for positive class (FAKE).
        threshold: Classification decision boundary.

    Returns:
        Dictionary of metrics including confusion matrix and rates.
    """
    y_true_np = np.array(y_true)
    y_prob_np = np.array(y_prob)
    y_pred_np = (y_prob_np >= threshold).astype(int)

    acc = accuracy_score(y_true_np, y_pred_np)
    prec = precision_score(y_true_np, y_pred_np, zero_division=0)
    rec = recall_score(y_true_np, y_pred_np, zero_division=0)
    f1 = f1_score(y_true_np, y_pred_np, zero_division=0)

    try:
        auc = roc_auc_score(y_true_np, y_prob_np)
    except ValueError:
        auc = 0.50

    cm = confusion_matrix(y_true_np, y_pred_np, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()

    # Forensic rates
    specificity = tn / max(1, (tn + fp))  # True Negative Rate
    far = fp / max(1, (fp + tn))          # False Alarm Rate / False Positive Rate
    frr = fn / max(1, (fn + tp))          # False Rejection Rate / False Negative Rate

    return {
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1_score": float(f1),
        "roc_auc": float(auc),
        "specificity": float(specificity),
        "false_alarm_rate": float(far),
        "false_rejection_rate": float(frr),
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp),
        },
        "sample_counts": {
            "total": int(len(y_true_np)),
            "real": int((y_true_np == 0).sum()),
            "fake": int((y_true_np == 1).sum()),
        }
    }


def benchmark_latency(
    model: nn.Module,
    input_size: Tuple[int, int] = (224, 224),
    device: torch.device = torch.device("cpu"),
    iterations: int = 50,
    warmup: int = 10
) -> Dict[str, float]:
    """
    Measures per-frame inference latency and throughput (FPS).
    """
    model.eval()
    model.to(device)
    dummy = torch.randn(1, 3, input_size[0], input_size[1], device=device)

    # Warmup
    with torch.no_grad():
        for _ in range(warmup):
            _ = model(dummy)
            if device.type == "cuda":
                torch.cuda.synchronize()

    # Benchmark
    timings = []
    with torch.no_grad():
        for _ in range(iterations):
            start = time.perf_counter()
            _ = model(dummy)
            if device.type == "cuda":
                torch.cuda.synchronize()
            elapsed = (time.perf_counter() - start) * 1000.0  # ms
            timings.append(elapsed)

    mean_ms = float(np.mean(timings))
    std_ms = float(np.std(timings))
    p95_ms = float(np.percentile(timings, 95))
    fps = 1000.0 / mean_ms if mean_ms > 0 else 0.0

    return {
        "mean_latency_ms": round(mean_ms, 2),
        "std_latency_ms": round(std_ms, 2),
        "p95_latency_ms": round(p95_ms, 2),
        "throughput_fps": round(fps, 1),
        "device": str(device),
    }
