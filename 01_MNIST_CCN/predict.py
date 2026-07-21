import torch
import matplotlib.pyplot as plt

from data_loader import get_test_loader, get_test_dataset
from model import CNN


model = CNN()

model.load_state_dict(
    torch.load("saved_models/mnist_cnn.pth")
)

model.eval()


# --------------------
# Evaluate Accuracy
# --------------------

test_loader = get_test_loader()

correct = 0
total = 0

with torch.no_grad():

    for images, labels in test_loader:

        outputs = model(images)

        predictions = torch.argmax(outputs, dim=1)

        correct += (predictions == labels).sum().item()

        total += labels.size(0)

accuracy = (correct / total) * 100

print(f"\nModel Accuracy: {accuracy:.2f}%\n")


# --------------------
# Predict One Image
# --------------------

test_dataset = get_test_dataset()

image, label = test_dataset[1]

input_image = image.unsqueeze(0)

with torch.no_grad():

    outputs = model(input_image)

prediction = torch.argmax(outputs, dim=1).item()

print(f"Actual Label   : {label}")
print(f"Predicted Label: {prediction}")


plt.imshow(image.squeeze(), cmap="gray")
plt.title(f"Actual: {label} | Predicted: {prediction}")
plt.axis("off")
plt.show()