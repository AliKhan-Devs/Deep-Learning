import os
import torch
import torch.nn as nn
from typing import Tuple, Dict, Any, Optional

from .efficientnet import EfficientNetB0Detector
from .xception import XceptionDetector


def create_model(
    model_name: str,
    num_classes: int = 2,
    pretrained: bool = True,
    dropout: Optional[float] = None
) -> nn.Module:
    """
    Factory function to instantiate deepfake detection models.

    Args:
        model_name: Identifier ('efficientnet_b0' or 'xception').
        num_classes: Number of target classes (default 2: REAL, FAKE).
        pretrained: Whether to load ImageNet base weights.
        dropout: Optional custom dropout rate.

    Returns:
        Instantiated nn.Module.
    """
    name_clean = model_name.lower().replace("-", "_").strip()

    if "efficientnet" in name_clean:
        rate = dropout if dropout is not None else 0.3
        return EfficientNetB0Detector(num_classes=num_classes, pretrained=pretrained, dropout=rate)
    elif "xception" in name_clean:
        rate = dropout if dropout is not None else 0.4
        return XceptionDetector(num_classes=num_classes, pretrained=pretrained, dropout=rate)
    else:
        raise ValueError(
            f"Unsupported architecture '{model_name}'. "
            "Supported options: ['efficientnet_b0', 'xception']"
        )


def load_detector_checkpoint(
    model: nn.Module,
    checkpoint_path: str,
    device: torch.device
) -> Tuple[nn.Module, Dict[str, Any]]:
    """
    Loads saved checkpoint weights into model and returns accompanying metadata.

    Args:
        model: PyTorch model instance.
        checkpoint_path: Path to .pth or .pt file.
        device: Device to map tensors onto.

    Returns:
        Tuple of (model, metadata_dict).
    """
    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(f"Checkpoint not found at: {checkpoint_path}")

    checkpoint = torch.load(checkpoint_path, map_location=device)

    # Check if checkpoint is full dict or raw state_dict
    if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
        state_dict = checkpoint["state_dict"]
        metadata = {
            "epoch": checkpoint.get("epoch", 0),
            "best_metrics": checkpoint.get("best_metrics", {}),
            "config": checkpoint.get("config", {})
        }
    elif isinstance(checkpoint, dict):
        state_dict = checkpoint
        metadata = {"epoch": 0, "best_metrics": {}, "config": {}}
    else:
        raise ValueError(f"Unrecognized checkpoint format in: {checkpoint_path}")

    # Handle DataParallel prefix if present
    cleaned_state_dict = {}
    for k, v in state_dict.items():
        key = k.replace("module.", "")
        cleaned_state_dict[key] = v

    model.load_state_dict(cleaned_state_dict)
    model.to(device)
    model.eval()
    return model, metadata
