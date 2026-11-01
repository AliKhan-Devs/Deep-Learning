from dataclasses import dataclass, field
from typing import List, Tuple, Optional


@dataclass
class TrainingConfig:
    """Configuration hyperparameters for model training and evaluation."""

    # Model definition
    model_name: str = "efficientnet_b0"  # or "xception"
    pretrained: bool = True
    num_classes: int = 2
    classes: List[str] = field(default_factory=lambda: ["REAL", "FAKE"])
    positive_class_index: int = 1  # 0: REAL, 1: FAKE

    # Dimensions & Normalization
    image_size: Tuple[int, int] = (224, 224)  # (299, 299) for Xception
    mean: Tuple[float, float, float] = (0.485, 0.456, 0.406)
    std: Tuple[float, float, float] = (0.229, 0.224, 0.225)
    face_margin: float = 0.25

    # Dataset paths
    data_root: str = "dataset"
    train_manifest: Optional[str] = None
    val_manifest: Optional[str] = None
    test_manifest: Optional[str] = None

    # Optimization
    batch_size: int = 32
    num_workers: int = 2
    epochs: int = 15
    lr: float = 1e-4
    weight_decay: float = 1e-4
    use_amp: bool = True  # Automatic Mixed Precision
    grad_clip_norm: float = 1.0

    # Scheduler & Early Stopping
    scheduler: str = "cosine"  # "cosine" or "plateau"
    min_lr: float = 1e-6
    patience: int = 4
    early_stopping_metric: str = "val_roc_auc"

    # Export & Output
    output_dir: str = "artifacts/models/efficientnet_b0"
    checkpoint_name: str = "best_model.pth"
    decision_threshold: float = 0.50
    seed: int = 42
