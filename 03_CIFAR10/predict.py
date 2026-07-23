import tkinter as tk
from tkinter import filedialog

import torch
from PIL import Image, ImageTk
from torchvision import transforms

from model import CNN


# -----------------------------
# CIFAR-10 Classes
# -----------------------------
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


# -----------------------------
# Load Model
# -----------------------------
model = CNN()

model.load_state_dict(
    torch.load(
        "saved_models/cifar10_cnn.pth",
        map_location=torch.device("cpu")
    )
)

model.eval()


# -----------------------------
# Image Transform
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((32, 32)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=(0.5, 0.5, 0.5),
        std=(0.5, 0.5, 0.5)
    )
])


# -----------------------------
# Predict Image
# -----------------------------
def predict_image():

    file_path = filedialog.askopenfilename(
        filetypes=[
            ("Image Files", "*.jpg *.jpeg *.png")
        ]
    )

    if not file_path:
        return

    # Load Image
    image = Image.open(file_path).convert("RGB")

    # Display Image
    display_image = image.resize((250, 250))

    photo = ImageTk.PhotoImage(display_image)

    image_label.config(image=photo)
    image_label.image = photo

    # Transform Image
    input_tensor = transform(image).unsqueeze(0)

    # Prediction
    with torch.no_grad():

        outputs = model(input_tensor)

        probabilities = torch.softmax(outputs, dim=1)

        confidence, prediction = torch.max(probabilities, dim=1)

    predicted_class = classes[prediction.item()]
    confidence_score = confidence.item() * 100

    result_label.config(
        text=f"Prediction : {predicted_class}\n"
             f"Confidence : {confidence_score:.2f}%"
    )

# -----------------------------
# GUI
# -----------------------------
root = tk.Tk()

root.title("CIFAR-10 Image Classifier")

root.geometry("500x650")

title = tk.Label(
    root,
    text="CIFAR-10 Image Classifier",
    font=("Arial", 18, "bold")
)

title.pack(pady=15)

button = tk.Button(
    root,
    text="Select Image",
    font=("Arial", 12),
    command=predict_image
)

button.pack(pady=10)

image_label = tk.Label(root)

image_label.pack(pady=15)

result_label = tk.Label(
    root,
    text="Select an image to begin...",
    font=("Arial", 15, "bold"),
    justify="center"
)

result_label.pack(pady=20)



root.mainloop()