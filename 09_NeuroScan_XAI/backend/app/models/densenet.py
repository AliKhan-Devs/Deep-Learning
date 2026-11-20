import torch
import torch.nn as nn
from torchvision.models import densenet121, DenseNet121_Weights

class NeuroScanDenseNet(nn.Module):
    def __init__(self, num_classes: int = 4, dropout_rate: float = 0.3):
        super().__init__()
        # Initialize architecture structure
        self.backbone = densenet121(weights=None)
        num_features = self.backbone.classifier.in_features
        
        # Clinical diagnostic head matching training notebook
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(p=dropout_rate),
            nn.Linear(num_features, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(inplace=True),
            nn.Dropout(p=dropout_rate / 2),
            nn.Linear(256, num_classes)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)
        
    def get_target_layer(self):
        # Target layer for Grad-CAM is the final dense block of DenseNet-121
        return self.backbone.features.denseblock4
