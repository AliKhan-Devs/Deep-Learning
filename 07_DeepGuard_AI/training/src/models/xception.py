import torch
import torch.nn as nn
try:
    import timm
    HAS_TIMM = True
except ImportError:
    HAS_TIMM = False


class XceptionDetector(nn.Module):
    """
    XceptionNet architecture specialized for Deepfake forensic artifact identification.
    Utilizes depthwise separable convolutions sensitive to manipulation boundary artifacts.
    Implements timm's genuine Xception architecture.
    """

    def __init__(self, num_classes: int = 2, pretrained: bool = True, dropout: float = 0.4):
        super().__init__()
        if not HAS_TIMM:
            raise ImportError(
                "timm is required for the Xception architecture. "
                "Install via: pip install timm"
            )

        # timm 'legacy_xception' or 'xception' provides the classic Xception architecture
        try:
            self.model = timm.create_model(
                "xception",
                pretrained=pretrained,
                num_classes=num_classes,
                drop_rate=dropout
            )
        except Exception:
            # Fallback for timm versions that name it legacy_xception
            self.model = timm.create_model(
                "legacy_xception",
                pretrained=pretrained,
                num_classes=num_classes,
                drop_rate=dropout
            )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass returning unnormalized class logits."""
        return self.model(x)

    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        """Extract global pooled feature representations."""
        return self.model.forward_features(x)
