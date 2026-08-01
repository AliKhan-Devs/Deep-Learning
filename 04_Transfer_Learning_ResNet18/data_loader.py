import torch
from torchvision import datasets, transforms
from torch.utils.data import DataLoader


# ---------------------------------
# Training Transform (Data Augmentation)
# ---------------------------------
train_transform = transforms.Compose([

    transforms.Resize((224, 224)),

    transforms.RandomHorizontalFlip(),

    transforms.RandomRotation(10),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ---------------------------------
# Test Transform (No Augmentation)
# ---------------------------------
test_transform = transforms.Compose([

    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ---------------------------------
# Training Dataset
# ---------------------------------
train_dataset = datasets.CIFAR10(
    root="./data",
    train=True,
    download=True,
    transform=train_transform
)


# ---------------------------------
# Test Dataset
# ---------------------------------
test_dataset = datasets.CIFAR10(
    root="./data",
    train=False,
    download=True,
    transform=test_transform
)


# ---------------------------------
# Data Loaders
# ---------------------------------
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


# ---------------------------------
# Class Names
# ---------------------------------
classes = train_dataset.classes


# ---------------------------------
# Testing
# ---------------------------------
if __name__ == "__main__":

    print(f"Training Images : {len(train_dataset)}")
    print(f"Test Images     : {len(test_dataset)}")
    print(f"Classes         : {classes}")

    images, labels = next(iter(train_loader))

    print(f"\nImage Batch Shape : {images.shape}")
    print(f"Label Batch Shape : {labels.shape}")