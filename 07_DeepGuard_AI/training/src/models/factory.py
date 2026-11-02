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


def adapt_state_dict_keys(state_dict: Dict[str, Any], model: nn.Module) -> Dict[str, Any]:
    """
    Intelligently adapts checkpoint keys to match model keys.
    Handles:
    - DataParallel 'module.' prefix
    - Wrapper prefixes like 'backbone.' (EfficientNetB0Detector) or 'model.' (XceptionDetector)
    - Direct torchvision or timm exports
    """
    model_keys = set(model.state_dict().keys())
    cleaned = {k.replace("module.", ""): v for k, v in state_dict.items()}

    # Exact match
    if set(cleaned.keys()) == model_keys:
        return cleaned

    # Check if model expects 'backbone.' prefix (e.g. EfficientNetB0Detector)
    with_backbone = {}
    for k, v in cleaned.items():
        if k in model_keys:
            with_backbone[k] = v
        elif f"backbone.{k}" in model_keys:
            with_backbone[f"backbone.{k}"] = v
    if len(with_backbone) >= len(model_keys) * 0.9:
        return with_backbone

    # Check if model expects 'model.' prefix (e.g. XceptionDetector)
    with_model = {}
    for k, v in cleaned.items():
        if k in model_keys:
            with_model[k] = v
        elif f"model.{k}" in model_keys:
            with_model[f"model.{k}"] = v
    if len(with_model) >= len(model_keys) * 0.9:
        return with_model

    # Check if model has no prefix but checkpoint does
    without_prefix = {}
    for k, v in cleaned.items():
        stripped = k
        if stripped.startswith("backbone."):
            stripped = stripped[len("backbone."):]
        elif stripped.startswith("model."):
            stripped = stripped[len("model."):]
        if stripped in model_keys:
            without_prefix[stripped] = v
    if len(without_prefix) >= len(model_keys) * 0.9:
        return without_prefix

    return cleaned


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

    adapted_state_dict = adapt_state_dict_keys(state_dict, model)
    try:
        model.load_state_dict(adapted_state_dict, strict=True)
    except RuntimeError:
        # Fallback to non-strict loading to accommodate minor buffer variations
        model.load_state_dict(adapted_state_dict, strict=False)

    model.to(device)
    model.eval()
    return model, metadata
