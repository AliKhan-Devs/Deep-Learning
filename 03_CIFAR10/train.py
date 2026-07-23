import os

import torch
import torch.nn as nn
import torch.optim as optim

from model import CNN
from data_loader import train_loader, test_loader


# Model
model = CNN()

# Loss Function
criterion = nn.CrossEntropyLoss()

# Optimizer
optimizer = optim.Adam(
    model.parameters(),
    lr=0.001
)

num_epochs = 20

best_accuracy = 0.0

os.makedirs("saved_models", exist_ok=True)

for epoch in range(num_epochs):

    # -------------------------
    # Training
    # -------------------------
    model.train()

    train_loss = 0.0

    for images, labels in train_loader:

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        train_loss += loss.item()

    train_loss /= len(train_loader)

    # -------------------------
    # Evaluation
    # -------------------------
    model.eval()

    val_loss = 0.0

    correct = 0
    total = 0

    with torch.no_grad():

        for images, labels in test_loader:

            outputs = model(images)

            loss = criterion(outputs, labels)

            val_loss += loss.item()

            predictions = torch.argmax(outputs, dim=1)

            correct += (predictions == labels).sum().item()

            total += labels.size(0)

    val_loss /= len(test_loader)

    accuracy = 100 * correct / total

    if accuracy > best_accuracy:

        best_accuracy = accuracy

        torch.save(
            model.state_dict(),
            "saved_models/cifar10_cnn.pth"
        )

    print(f"\nEpoch [{epoch+1}/{num_epochs}]")
    print(f"Train Loss : {train_loss:.4f}")
    print(f"Test Loss  : {val_loss:.4f}")
    print(f"Test Acc   : {accuracy:.2f}%")

print("\nTraining Complete!")
print(f"Best Test Accuracy: {best_accuracy:.2f}%")