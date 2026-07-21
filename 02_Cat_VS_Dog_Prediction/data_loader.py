from torchvision import datasets, transforms
from torch.utils.data import DataLoader, random_split

# Image preprocessing
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=(0.5, 0.5, 0.5),
        std=(0.5, 0.5, 0.5)
    )
])

# Load dataset
dataset = datasets.ImageFolder(
    root="dataset",
    transform=transform
)

# Split dataset
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size

train_dataset, val_dataset = random_split(
    dataset,
    [train_size, val_size]
)

# DataLoaders
train_loader = DataLoader(
    train_dataset,
    batch_size=32,
    shuffle=True
)

val_loader = DataLoader(
    val_dataset,
    batch_size=32,
    shuffle=False
)

# Class names
classes = dataset.classes

print(f"Total Images      : {len(dataset)}")
print(f"Training Images   : {len(train_dataset)}")
print(f"Validation Images : {len(val_dataset)}")
print(f"Classes           : {classes}")


# verification 

images, labels = next(iter(train_loader))

print(images.shape)
print(labels.shape)
print(labels[:10])