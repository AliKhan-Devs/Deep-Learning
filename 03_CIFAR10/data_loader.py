import matplotlib.pyplot as plt

import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader


# -----------------------------
# Image Transform
# -----------------------------
transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(
        mean=(0.5, 0.5, 0.5),
        std=(0.5, 0.5, 0.5)
    )
])


# -----------------------------
# Training Dataset
# -----------------------------
train_dataset = datasets.CIFAR10(
    root="./data",
    train=True,
    download=True,
    transform=transform
)


# -----------------------------
# Testing Dataset
# -----------------------------
test_dataset = datasets.CIFAR10(
    root="./data",
    train=False,
    download=True,
    transform=transform
)


# -----------------------------
# Data Loaders
# -----------------------------
train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    shuffle=True
)

test_loader = DataLoader(
    test_dataset,
    batch_size=32,
    shuffle=False
)


# -----------------------------
# Display Dataset Information
# -----------------------------
if __name__ == "__main__":

    print(f"Training Images : {len(train_dataset)}")
    print(f"Testing Images  : {len(test_dataset)}")

    print("\nClasses:")

    # Display Class Names enumerate function returns index and class name
    for index, class_name in enumerate(train_dataset.classes):
        print(f"{index} : {class_name}")

    images, labels = next(iter(train_loader))

    print("\nBatch Shape:")
    print(images.shape)

    print("\nLabels Shape:")
    print(labels.shape)


    # -----------------------------
    # Display First 8 Images
    # -----------------------------
    classes = train_dataset.classes

    fig, axes = plt.subplots(2, 4, figsize=(10, 5))

    for i in range(8):

        image = images[i]

        # Unnormalize
        image = image * 0.5 + 0.5

        image = image.permute(1, 2, 0)

        ax = axes[i // 4, i % 4]

        ax.imshow(image)

        ax.set_title(classes[labels[i]])

        ax.axis("off")

        plt.tight_layout()
        plt.show()