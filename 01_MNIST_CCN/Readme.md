# Handwritten Digit Recognition using Convolutional Neural Networks (CNN)

## Project Overview

This project implements a **Convolutional Neural Network (CNN)** from scratch using **PyTorch** to classify handwritten digits from the **MNIST** dataset.

The goal of this project was not only to build a working digit classifier but also to understand the complete deep learning pipeline, including:

* Loading datasets
* Building a CNN architecture
* Forward propagation
* Loss calculation
* Backpropagation
* Optimizer updates
* Model evaluation
* Making predictions on unseen images

This project was completed as part of my deep learning learning journey before moving toward larger computer vision projects.

---

# Project Structure

```
Project_01_MNIST_CNN/
│
├── data/
│
├── saved_models/
│   └── mnist_cnn.pth
│
├── data_loader.py
├── model.py
├── train.py
├── predict.py
│
├── requirements.txt
└── README.md
```

---

# CNN Architecture

The implemented CNN consists of one convolutional block followed by a fully connected classifier.

```
Input Image
(1 × 28 × 28)

        │
        ▼

Conv2D
8 Filters
Kernel Size = 3 × 3

        │
        ▼

ReLU Activation

        │
        ▼

Max Pooling
2 × 2

        │
        ▼

Flatten

        │
        ▼

Fully Connected Layer

        │
        ▼

10 Output Logits
(Digits 0–9)
```

---

# Training Configuration

| Parameter     | Value            |
| ------------- | ---------------- |
| Framework     | PyTorch          |
| Dataset       | MNIST            |
| Optimizer     | Adam             |
| Loss Function | CrossEntropyLoss |
| Learning Rate | 0.001            |
| Batch Size    | 32               |
| Epochs        | 5                |

---

# Dataset

The project uses the **MNIST** handwritten digit dataset.

### Training Set

* 60,000 images

### Test Set

* 10,000 images

Each image is:

* Grayscale
* 28 × 28 pixels
* Single channel

---

# Training Pipeline

The CNN is trained using the standard deep learning workflow.

```
Images
   │
   ▼

Forward Pass

   │
   ▼

Logits

   │
   ▼

CrossEntropy Loss

   │
   ▼

Backpropagation

   │
   ▼

Gradient Computation

   │
   ▼

Adam Optimizer

   │
   ▼

Updated Weights
```

This process is repeated for every mini-batch across multiple epochs until the model learns meaningful visual features.

---

# Results

Training completed successfully.

Average training loss decreased steadily over five epochs.

Example:

```
Epoch [1/5] - Average Loss: 0.3164
Epoch [2/5] - Average Loss: 0.1465
Epoch [3/5] - Average Loss: 0.1042
Epoch [4/5] - Average Loss: 0.0843
Epoch [5/5] - Average Loss: 0.0737
```

Final Test Accuracy:

```
97.47%
```

---

# Prediction

After training, the model is saved and loaded for inference.

The prediction script:

* Loads the trained model
* Evaluates accuracy on the complete test dataset
* Predicts the label of a sample handwritten digit
* Displays both the actual and predicted labels

---

# Concepts Practiced

During this project, the following concepts were implemented and understood:

* PyTorch Tensors
* torchvision Datasets
* DataLoader
* Mini-batch Training
* Convolution Layer
* ReLU Activation
* Max Pooling
* Flatten Layer
* Fully Connected Layer
* Logits
* CrossEntropy Loss
* Backpropagation
* Gradient Computation
* Adam Optimizer
* Training Loop
* Model Saving
* Model Loading
* Model Evaluation
* Accuracy Calculation
* Prediction

---

# Technologies Used

* Python
* PyTorch
* Torchvision
* Matplotlib

---

# Learning Outcome

This project provided hands-on experience with building and training a Convolutional Neural Network from scratch using PyTorch.

Rather than treating PyTorch as a black box, the focus was on understanding how data flows through the network, how convolution extracts visual features, how gradients are computed through backpropagation, and how the optimizer updates model weights to improve predictions.

This project serves as the foundation for more advanced computer vision models such as deeper CNN architectures, transfer learning, object detection, and real-time vision systems.

---

## Result Summary

* Built a CNN from scratch using PyTorch.
* Trained on 60,000 handwritten digit images.
* Evaluated on 10,000 unseen test images.
* Achieved **97.47% test accuracy**.
* Implemented the complete deep learning training and inference pipeline.
