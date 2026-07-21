import torch
import torch.nn as nn

from data_loader import get_train_loader
from model import CNN


train_loader = get_train_loader()

model = CNN()

criterion = nn.CrossEntropyLoss()

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001
)

num_epochs = 5


for epoch in range(num_epochs):

    epoch_loss = 0

    for images, labels in train_loader:

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        epoch_loss += loss.item()

    average_loss = epoch_loss / len(train_loader)

    print(f"Epoch [{epoch + 1}/{num_epochs}] - Average Loss: {average_loss:.4f}")


torch.save(model.state_dict(), "saved_models/mnist_cnn.pth")

print("\nModel saved successfully!")