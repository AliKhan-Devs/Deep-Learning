import tkinter as tk
from tkinter import filedialog

import torch
import torch.nn.functional as F

from PIL import Image, ImageTk
from torchvision import transforms

from model import ResNetClassifier


# ---------------------------------
# Device
# ---------------------------------
device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

# ---------------------------------
# CIFAR-10 Classes
# ---------------------------------
classes = [
    "Airplane",
    "Automobile",
    "Bird",
    "Cat",
    "Deer",
    "Dog",
    "Frog",
    "Horse",
    "Ship",
    "Truck"
]

# ---------------------------------
# Load Model
# ---------------------------------
model = ResNetClassifier()

model.load_state_dict(
    torch.load(
        "resnet18_transfer_learning.pth",
        map_location=device
    )
)

model.to(device)
model.eval()

# ---------------------------------
# Image Transform
# ---------------------------------
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ---------------------------------
# Prediction Function
# ---------------------------------
def predict_image():

    file_path = filedialog.askopenfilename(
        filetypes=[
            ("Image Files", "*.jpg *.jpeg *.png")
        ]
    )

    if not file_path:
        return

    image = Image.open(file_path).convert("RGB")

    # Display Image
    display = image.copy()
    display.thumbnail((300, 300))

    photo = ImageTk.PhotoImage(display)

    image_label.config(image=photo)
    image_label.image = photo

    # Prediction
    input_tensor = transform(image)
    input_tensor = input_tensor.unsqueeze(0).to(device)

    with torch.no_grad():

        outputs = model(input_tensor)

        probabilities = F.softmax(outputs, dim=1)

        confidence, prediction = torch.max(
            probabilities,
            dim=1
        )

    predicted_class = classes[prediction.item()]
    confidence_score = confidence.item() * 100

    result_label.config(
        text=f"Prediction : {predicted_class}\n"
             f"Confidence : {confidence_score:.2f}%"
    )


# ---------------------------------
# Tkinter UI
# ---------------------------------
root = tk.Tk()

root.title("CIFAR-10 Image Classifier (ResNet18)")
root.geometry("500x550")

title = tk.Label(
    root,
    text="Transfer Learning - ResNet18",
    font=("Arial", 18, "bold")
)
title.pack(pady=10)

btn = tk.Button(
    root,
    text="Select Image",
    command=predict_image,
    font=("Arial", 12),
    width=20
)
btn.pack(pady=10)

image_label = tk.Label(root)
image_label.pack(pady=10)

result_label = tk.Label(
    root,
    text="Select an image...",
    font=("Arial", 14)
)
result_label.pack(pady=20)

root.mainloop()