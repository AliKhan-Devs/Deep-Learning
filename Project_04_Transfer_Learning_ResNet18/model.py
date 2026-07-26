import torch.nn as nn

from torchvision.models import (
    resnet18,
    ResNet18_Weights
)


class ResNetClassifier(nn.Module):

    def __init__(self):

        super().__init__()

        # ---------------------------------
        # Load Pretrained ResNet18
        # ---------------------------------
        self.model = resnet18(
            weights=ResNet18_Weights.DEFAULT
        )

        # ---------------------------------
        # Freeze All Pretrained Layers
        # ---------------------------------
        for parameter in self.model.parameters():
            parameter.requires_grad = False

        # ---------------------------------
        # Replace Final Layer
        # ---------------------------------
        in_features = self.model.fc.in_features

        self.model.fc = nn.Linear(
            in_features,
            10
        )

    def forward(self, x):
        return self.model(x)


# ---------------------------------
# Testing
# ---------------------------------
if __name__ == "__main__":

    import torch

    model = ResNetClassifier()

    dummy = torch.randn(1, 3, 224, 224)

    output = model(dummy)

    print(model)

    print("\nOutput Shape:", output.shape)

    trainable_params = sum(
        p.numel() for p in model.parameters()
        if p.requires_grad
    )

    total_params = sum(
        p.numel() for p in model.parameters()
    )

    print(f"\nTrainable Parameters : {trainable_params:,}")
    print(f"Total Parameters     : {total_params:,}")