import torch
import torch.nn as nn
import torch.optim as optim

from model import ResNetClassifier
from data_loader import train_loader, test_loader


# ---------------------------------
# Device Configuration
# ---------------------------------
device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print(f"Using Device: {device}")


# ---------------------------------
# Model
# ---------------------------------
model = ResNetClassifier().to(device)


# ---------------------------------
# Loss Function
# ---------------------------------
criterion = nn.CrossEntropyLoss()


# ---------------------------------
# Optimizer
# Only Trainable Parameters
# ---------------------------------
optimizer = optim.Adam(
    filter(lambda p: p.requires_grad, model.parameters()),
    lr=0.001
)


# ---------------------------------
# Training Settings
# ---------------------------------
num_epochs = 10

best_accuracy = 0.0


# ---------------------------------
# Training Loop
# ---------------------------------
for epoch in range(num_epochs):

    model.train()

    train_loss = 0.0

    for images, labels in train_loader:

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        train_loss += loss.item()

    avg_train_loss = train_loss / len(train_loader)

    # ---------------------------------
    # Validation
    # ---------------------------------
    model.eval()

    val_loss = 0.0

    correct = 0
    total = 0

    with torch.no_grad():

        for images, labels in test_loader:

            images = images.to(device)
            labels = labels.to(device)

            outputs = model(images)

            loss = criterion(outputs, labels)

            val_loss += loss.item()

            _, predicted = torch.max(outputs, 1)

            total += labels.size(0)

            correct += (predicted == labels).sum().item()

    avg_val_loss = val_loss / len(test_loader)

    accuracy = 100 * correct / total

    print(f"\nEpoch [{epoch+1}/{num_epochs}]")
    print(f"Train Loss : {avg_train_loss:.4f}")
    print(f"Test Loss  : {avg_val_loss:.4f}")
    print(f"Test Acc   : {accuracy:.2f}%")

    # ---------------------------------
    # Save Best Model
    # ---------------------------------
    if accuracy > best_accuracy:

        best_accuracy = accuracy

        torch.save(
            model.state_dict(),
            "resnet18_transfer_learning.pth"
        )

print("\nTraining Complete!")
print(f"Best Test Accuracy: {best_accuracy:.2f}%")