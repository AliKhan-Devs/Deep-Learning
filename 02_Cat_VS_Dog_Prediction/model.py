import torch
import torch.nn as nn


class CNN(nn.Module):

    def __init__(self):
        super().__init__()

        # Block 1
        self.conv1 = nn.Conv2d(
            in_channels=3,
            out_channels=16,
            kernel_size=3,
            padding=1
        )

        # Block 2
        self.conv2 = nn.Conv2d(
            in_channels=16,
            out_channels=32,
            kernel_size=3,
            padding=1
        )

        # Block 3
        self.conv3 = nn.Conv2d(
            in_channels=32,
            out_channels=64,
            kernel_size=3,
            padding=1
        )

        self.relu = nn.ReLU()
        self.pool = nn.MaxPool2d(kernel_size=2)

        # Fully Connected Layer
        self.fc = nn.Linear(64 * 16 * 16, 2)

    def forward(self, x):

        # Block 1
        x = self.pool(self.relu(self.conv1(x)))
        print("After Block 1 :", x.shape)

        # Block 2
        x = self.pool(self.relu(self.conv2(x)))
        print("After Block 2 :", x.shape)

        # Block 3
        x = self.pool(self.relu(self.conv3(x)))
        print("After Block 3 :", x.shape)

        # Flatten
        x = torch.flatten(x, start_dim=1)
        print("After Flatten:", x.shape)

        # Fully Connected Layer
        x = self.fc(x)
        print("After FC      :", x.shape)

        return x