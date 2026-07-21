import os

import torch
import torch.nn as nn
import torch.optim as optim

from model import CNN
from data_loader import train_loader, val_loader


# -----------------------------
# Model
# -----------------------------
model = CNN()

# -----------------------------
# Loss Function
# -----------------------------
criterion = nn.CrossEntropyLoss()

# -----------------------------
# Optimizer
# -----------------------------
optimizer = optim.Adam(
    model.parameters(),
    lr=0.001
)

# -----------------------------
# Training Settings
# -----------------------------
num_epochs = 10

best_accuracy = 0.0

os.makedirs("saved_models", exist_ok=True)

# -----------------------------
# Training Loop
# -----------------------------
for epoch in range(num_epochs):

    # =========================
    # Training Phase
    # =========================
    model.train()

    running_train_loss = 0.0

    for images, labels in train_loader:

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_train_loss += loss.item()

    average_train_loss = running_train_loss / len(train_loader)

    # =========================
    # Validation Phase
    # =========================
    model.eval()

    running_val_loss = 0.0

    correct_predictions = 0

    total_samples = 0

    with torch.no_grad():

        for images, labels in val_loader:

            outputs = model(images)

            loss = criterion(outputs, labels)

            running_val_loss += loss.item()

            predictions = torch.argmax(outputs, dim=1)

            correct_predictions += (predictions == labels).sum().item()

            total_samples += labels.size(0)

    average_val_loss = running_val_loss / len(val_loader)

    validation_accuracy = (
        correct_predictions / total_samples
    ) * 100

    # =========================
    # Save Best Model
    # =========================
    if validation_accuracy > best_accuracy:

        best_accuracy = validation_accuracy

        torch.save(
            model.state_dict(),
            "saved_models/best_model.pth"
        )

    # =========================
    # Print Results
    # =========================
    print(f"\nEpoch [{epoch+1}/{num_epochs}]")
    print(f"Train Loss : {average_train_loss:.4f}")
    print(f"Val Loss   : {average_val_loss:.4f}")
    print(f"Val Acc    : {validation_accuracy:.2f}%")

print("\nTraining Complete!")
print(f"Best Validation Accuracy: {best_accuracy:.2f}%")