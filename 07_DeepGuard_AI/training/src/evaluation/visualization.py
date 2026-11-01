import os
from typing import Dict, List, Optional
import matplotlib.pyplot as plt
import numpy as np
from sklearn.metrics import roc_curve, auc, confusion_matrix


def plot_loss_curves(
    history: Dict[str, list],
    save_path: Optional[str] = None
) -> None:
    """Plots training and validation loss and accuracy curves."""
    epochs = range(1, len(history["train_loss"]) + 1)
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Loss plot
    axes[0].plot(epochs, history["train_loss"], "o-", label="Train Loss", color="#2563eb")
    axes[0].plot(epochs, history["val_loss"], "s-", label="Val Loss", color="#dc2626")
    axes[0].set_title("Training & Validation Loss")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Loss")
    axes[0].grid(True, linestyle="--", alpha=0.6)
    axes[0].legend()

    # Accuracy / AUC plot
    axes[1].plot(epochs, [a * 100 for a in history["train_acc"]], "o-", label="Train Acc (%)", color="#2563eb")
    axes[1].plot(epochs, [a * 100 for a in history["val_acc"]], "s-", label="Val Acc (%)", color="#dc2626")
    if "val_roc_auc" in history and len(history["val_roc_auc"]) == len(epochs):
        axes[1].plot(epochs, [auc * 100 for auc in history["val_roc_auc"]], "^--", label="Val ROC-AUC (%)", color="#059669")
    axes[1].set_title("Performance Metrics")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Score (%)")
    axes[1].grid(True, linestyle="--", alpha=0.6)
    axes[1].legend()

    plt.tight_layout()
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path, dpi=300)
        plt.close()
    else:
        plt.show()


def plot_roc_curve(
    y_true: List[int],
    y_prob: List[float],
    model_name: str = "DeepGuard AI",
    save_path: Optional[str] = None
) -> None:
    """Plots Receiver Operating Characteristic (ROC) curve."""
    fpr, tpr, _ = roc_curve(y_true, y_prob)
    roc_auc = auc(fpr, tpr)

    plt.figure(figsize=(7, 6))
    plt.plot(fpr, tpr, color="#2563eb", lw=2, label=f"{model_name} (AUC = {roc_auc:.4f})")
    plt.plot([0, 1], [0, 1], color="#9ca3af", lw=1.5, linestyle="--", label="Chance (AUC = 0.5000)")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate (1 - Specificity)")
    plt.ylabel("True Positive Rate (Sensitivity / Recall)")
    plt.title(f"ROC Curve - {model_name}")
    plt.legend(loc="lower right")
    plt.grid(True, linestyle="--", alpha=0.6)

    plt.tight_layout()
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path, dpi=300)
        plt.close()
    else:
        plt.show()


def plot_confusion_matrix(
    y_true: List[int],
    y_pred: List[int],
    classes: List[str] = None,
    save_path: Optional[str] = None
) -> None:
    """Plots formatted forensic confusion matrix."""
    if classes is None:
        classes = ["REAL", "FAKE"]

    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])

    fig, ax = plt.subplots(figsize=(6, 5))
    cax = ax.matshow(cm, cmap=plt.cm.Blues, alpha=0.8)

    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(x=j, y=i, s=f"{cm[i, j]}", va="center", ha="center", size="xx-large")

    plt.title("Forensic Confusion Matrix", pad=20)
    fig.colorbar(cax)
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(classes)
    ax.set_yticklabels(classes)
    plt.xlabel("Predicted Class")
    plt.ylabel("Ground Truth Class")

    plt.tight_layout()
    if save_path:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        plt.savefig(save_path, dpi=300)
        plt.close()
    else:
        plt.show()
