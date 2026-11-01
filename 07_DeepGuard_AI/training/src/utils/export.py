import os
import json
import torch
from typing import Dict, Any


def export_model_checkpoint(
    model: torch.nn.Module,
    optimizer: torch.optim.Optimizer,
    epoch: int,
    metrics: Dict[str, float],
    config_dict: Dict[str, Any],
    output_dir: str,
    checkpoint_name: str = "best_model.pth",
) -> str:
    """
    Saves trained model state dict, metadata, and writes the deployment model_config.json.

    Args:
        model: Trained PyTorch model.
        optimizer: PyTorch optimizer instance.
        epoch: Epoch index of best checkpoint.
        metrics: Dictionary of validation metrics (accuracy, roc_auc, f1).
        config_dict: Metadata dictionary matching deployment schema.
        output_dir: Directory where checkpoint and config will be stored.
        checkpoint_name: Name of the .pth weights file.

    Returns:
        Path to the saved checkpoint.
    """
    os.makedirs(output_dir, exist_ok=True)
    checkpoint_path = os.path.join(output_dir, checkpoint_name)

    # Save state dict with training metadata
    payload = {
        "epoch": epoch,
        "model_architecture": config_dict.get("architecture", "unknown"),
        "state_dict": model.state_dict(),
        "optimizer_state_dict": optimizer.state_dict(),
        "best_metrics": metrics,
        "config": config_dict,
    }
    torch.save(payload, checkpoint_path)
    print(f"[Export] Checkpoint saved successfully: {checkpoint_path}")

    # Write companion model_config.json
    config_path = os.path.join(output_dir, "model_config.json")
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config_dict, f, indent=2)
    print(f"[Export] Companion config saved: {config_path}")

    return checkpoint_path
