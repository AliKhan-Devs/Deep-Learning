from torchvision import datasets, transforms
from torch.utils.data import DataLoader


transform = transforms.ToTensor()


def get_train_loader(batch_size=32):

    train_dataset = datasets.MNIST(
        root="./data",
        train=True,
        download=True,
        transform=transform
    )

    train_loader = DataLoader(
        dataset=train_dataset,
        batch_size=batch_size,
        shuffle=True
    )

    return train_loader


def get_test_loader(batch_size=32):

    test_dataset = datasets.MNIST(
        root="./data",
        train=False,
        download=True,
        transform=transform
    )

    test_loader = DataLoader(
        dataset=test_dataset,
        batch_size=batch_size,
        shuffle=False
    )

    return test_loader


def get_test_dataset():

    return datasets.MNIST(
        root="./data",
        train=False,
        download=True,
        transform=transform
    )