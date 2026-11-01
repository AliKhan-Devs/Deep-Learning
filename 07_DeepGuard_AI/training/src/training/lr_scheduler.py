import torch
from torch.optim.lr_scheduler import (
    CosineAnnealingLR,
    ReduceLROnPlateau,
    _LRScheduler
)


def build_lr_scheduler(
    optimizer: torch.optim.Optimizer,
    scheduler_type: str = "cosine",
    epochs: int = 15,
    min_lr: float = 1e-6,
) -> _LRScheduler:
    """
    Constructs a learning rate scheduler for deepfake model convergence.

    Args:
        optimizer: Configured torch optimizer.
        scheduler_type: "cosine" for CosineAnnealingLR or "plateau" for ReduceLROnPlateau.
        epochs: Total training epochs.
        min_lr: Minimum floor learning rate.
    """
    if scheduler_type.lower() == "cosine":
        return CosineAnnealingLR(optimizer, T_max=epochs, eta_min=min_lr)
    elif scheduler_type.lower() == "plateau":
        return ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=2, min_lr=min_lr)
    else:
        raise ValueError(f"Unknown scheduler type: {scheduler_type}")
