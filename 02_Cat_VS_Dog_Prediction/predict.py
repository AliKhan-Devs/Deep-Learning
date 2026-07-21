import tkinter as tk
from tkinter import filedialog

import torch
import torch.nn.functional as F

from PIL import Image, ImageTk
from torchvision import transforms

from model import CNN


# -----------------------------
# Load Model
# -----------------------------
model = CNN()

model.load_state_dict(
    torch.load(
        "saved_models/best_model.pth",
        map_location=torch.device("cpu")
    )
)

model.eval()


# -----------------------------
# Image Transform
# -----------------------------
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.5, 0.5, 0.5],
        std=[0.5, 0.5, 0.5]
    )
])

classes = ["Cat", "Dog"]


# -----------------------------
# Prediction Function
# -----------------------------
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
    display_image = image.resize((300, 300))
    photo = ImageTk.PhotoImage(display_image)

    image_label.config(image=photo)
    image_label.image = photo

    # Prediction
    input_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():

        outputs = model(input_tensor)

        probabilities = F.softmax(outputs, dim=1)

        confidence, prediction = torch.max(
            probabilities,
            dim=1
        )

    result_label.config(
        text=f"Prediction : {classes[prediction.item()]}"
    )

    confidence_label.config(
        text=f"Confidence : {confidence.item()*100:.2f}%"
    )


# -----------------------------
# GUI
# -----------------------------
root = tk.Tk()

root.title("Cats vs Dogs Classifier")

root.geometry("500x600")

root.resizable(False, False)

title = tk.Label(
    root,
    text="Cats vs Dogs Classifier",
    font=("Arial", 18, "bold")
)

title.pack(pady=20)

upload_button = tk.Button(
    root,
    text="Upload Image",
    command=predict_image,
    font=("Arial", 12),
    width=20
)

upload_button.pack()

image_label = tk.Label(root)
image_label.pack(pady=20)

result_label = tk.Label(
    root,
    text="Prediction : ",
    font=("Arial", 14)
)

result_label.pack()

confidence_label = tk.Label(
    root,
    text="Confidence : ",
    font=("Arial", 14)
)

confidence_label.pack()

root.mainloop()