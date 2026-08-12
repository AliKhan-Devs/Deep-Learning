# Project 06 — Face Mask Detection with YOLOv8

A custom real-time **Face Mask Detection** system built using **YOLOv8** and a custom annotated dataset.

This project extends the object-detection knowledge developed in Project 05 by moving from **pretrained COCO detection** to **custom YOLO training**, dataset annotation, model evaluation, and real-time inference.

The project detects two classes:

* `mask`
* `no_mask`

The trained model can process images and live webcam frames while automatically generating bounding boxes and confidence scores.

---

## Project Overview

In Project 05, YOLOv8 was used with pretrained weights to detect objects from the COCO dataset.

However, pretrained COCO models do not contain a dedicated `mask` or `no_mask` class.

Therefore, this project focuses on the complete custom object-detection workflow:

```text
Custom Dataset
      ↓
Object Annotation
      ↓
YOLO Dataset Structure
      ↓
data.yaml
      ↓
YOLOv8 Training
      ↓
Best Model
      ↓
Validation
      ↓
Model Evaluation
      ↓
Real-Time Detection
```

This project also introduces the evaluation techniques required to determine whether a trained detector is actually performing well.

---

# Project Objectives

The main objectives of this project are to:

* Understand custom YOLO object detection.
* Prepare a custom detection dataset.
* Understand YOLO annotation format.
* Create a YOLO `data.yaml` configuration.
* Train YOLOv8 on custom classes.
* Save and load the best trained model.
* Perform image-based inference.
* Perform real-time webcam inference.
* Understand YOLO training losses.
* Understand validation metrics.
* Analyze the confusion matrix.
* Understand Precision and Recall.
* Understand mAP50 and mAP50-95.
* Understand P, R, PR, and F1 curves.
* Understand confidence thresholds.
* Learn how model evaluation affects real-world deployment decisions.

---

#  What I Learned

This project covers the complete lifecycle of a custom YOLO detector.

## Dataset Preparation

Learned:

* Why object detection requires annotations.
* Difference between classification labels and detection labels.
* Train/validation/test dataset separation.
* YOLO annotation format.
* Normalized bounding-box coordinates.
* Class IDs.
* Importance of matching image and label filenames.

---

## YOLO Configuration

Learned how `data.yaml` tells YOLO:

* Where the training images are.
* Where the validation images are.
* Where the test images are.
* How many classes exist.
* What the class names are.

Example:

```yaml
path: /path/to/dataset

train: train/images
val: valid/images
test: test/images

nc: 2

names:
  0: no_mask
  1: mask
```

---

#  Dataset Structure

The dataset was organized into separate training, validation, and testing directories.

Data set link: https://drive.google.com/drive/folders/1HMxrWNJ2fHJm85WF2a6a1n4jVqQbEcHs?usp=sharing

```text
dataset/
│
├── train/
│   ├── images/
│   └── labels/
│
├── valid/
│   ├── images/
│   └── labels/
│
└── test/
    ├── images/
    └── labels/
```

Each image has a corresponding YOLO annotation file.

Example:

```text
images/
    person01.jpg

labels/
    person01.txt
```

The filenames must match so YOLO can associate the image with its annotations.

---

#  YOLO Annotation Format

Each object is represented using five values:

```text
class_id x_center y_center width height
```

Example:

```text
1 0.52 0.47 0.21 0.18
```

The coordinates are normalized between:

```text
0 → 1
```

rather than being stored as raw pixel coordinates.

This allows the same annotations to work across different image resolutions.

For example:

```text
x_center = 0.5
y_center = 0.5
```

means the center of the object is located at the center of the image.

---

# Classes

The final project contains two classes:

```text
0 → no_mask
1 → mask
```

Correct class ordering is important because YOLO uses the numerical class ID internally.

---

# Training

The project uses a pretrained YOLOv8 model as the starting point.

Instead of training the entire neural network from random weights, transfer learning is used.

```text
Pretrained YOLOv8
       ↓
Custom Dataset
       ↓
Fine-Tuning
       ↓
Face Mask Detector
```

This allows the model to reuse useful visual features learned from large-scale datasets while learning the new `mask` and `no_mask` classes.

---

# Training Concept

The model learns three major aspects during detection training:

### 1. Bounding Box Localization

Where is the object?

Measured using:

```text
Box Loss
```

### 2. Classification

What object is inside the bounding box?

Measured using:

```text
Classification Loss
```

### 3. Precise Bounding Box Localization

How accurately should the four bounding-box boundaries fit the object?

Measured using:

```text
DFL Loss
```

Therefore:

```text
Box Loss
    ↓
Where is the object?

Classification Loss
    ↓
What is the object?

DFL Loss
    ↓
How precisely does the box fit the object?
```

---

# Training Losses

YOLO produces several training curves.

## Box Loss

Measures bounding-box localization error.

A decreasing Box Loss generally indicates that the model is becoming better at locating objects.

---

## Classification Loss

Measures classification error.

A decreasing Classification Loss indicates that the model is becoming better at distinguishing between:

```text
mask
```

and

```text
no_mask
```

---

## DFL Loss

DFL stands for:

**Distribution Focal Loss**

It helps YOLO learn more precise bounding-box boundaries.

A decreasing DFL Loss generally indicates improving localization precision.

---

# Validation and Evaluation

Training loss alone is not enough to determine whether the model is good.

The model must also be evaluated on unseen validation data.

This allows us to measure how well the learned model generalizes beyond the training images.

Important evaluation metrics include:

* Precision
* Recall
* mAP50
* mAP50-95
* Confusion Matrix
* F1 Score

---

# Precision

Precision answers:

> **When the model says an object belongs to a class, how often is that prediction correct?**

Formula:

```text
Precision = TP / (TP + FP)
```

High Precision means fewer false-positive detections.

For example:

```text
100 predictions

90 correct
10 incorrect
```

gives:

```text
Precision = 90 / 100 = 90%
```

---

# Recall

Recall answers:

> **How many of the actual objects did the model successfully detect?**

Formula:

```text
Recall = TP / (TP + FN)
```

For example:

```text
80 actual masks

60 successfully detected
```

gives:

```text
Recall = 60 / 80 = 75%
```

---

# Precision vs Recall

There is normally a trade-off between Precision and Recall.

A stricter detector may produce:

```text
Higher Precision
Lower Recall
```

while a more permissive detector may produce:

```text
Higher Recall
Lower Precision
```

The appropriate balance depends on the application.

---

#  mAP50

mAP stands for:

**Mean Average Precision**

mAP50 evaluates detection performance using an IoU threshold of:

```text
0.50
```

A predicted bounding box must sufficiently overlap the ground-truth box to count as a correct detection.

Higher mAP generally indicates better detection performance.

---

#  mAP50-95

mAP50-95 is a stricter and more comprehensive metric.

Instead of evaluating only at IoU:

```text
0.50
```

it evaluates across multiple IoU thresholds:

```text
0.50 → 0.55 → 0.60 → ... → 0.95
```

Therefore, mAP50-95 gives a more demanding measurement of detection quality and localization accuracy.

It is usually significantly lower than mAP50, which is normal.

---

# Confusion Matrix

The confusion matrix compares actual and predicted classes.

For the two project classes:

```text
mask
no_mask
```

the matrix helps identify whether the model is confusing one class with the other.

Conceptually:

```text
                 Predicted
              no_mask     mask

Actual
no_mask         ✓          ✗

mask            ✗          ✓
```

The diagonal represents correct class predictions.

Off-diagonal values represent class confusion.

For example:

```text
Actual Mask
     ↓
Predicted No Mask
```

indicates that the model confused a masked face with an unmasked face.

---

# YOLO Evaluation Curves

YOLO also generates several curves that show how detection performance changes with the confidence threshold.

---

## P Curve

**Precision vs Confidence**

Shows how Precision changes as the confidence threshold changes.

Generally:

```text
Higher threshold
      ↓
More selective predictions
      ↓
Higher Precision
```

---

## R Curve

**Recall vs Confidence**

Shows how Recall changes as the confidence threshold changes.

Generally:

```text
Higher threshold
      ↓
More rejected predictions
      ↓
Lower Recall
```

---

## PR Curve

**Precision vs Recall**

Shows the relationship between Precision and Recall.

It helps visualize the trade-off between:

```text
Trustworthy predictions
```

and

```text
Finding more objects
```

A strong detector generally maintains high Precision and high Recall.

---

## F1 Curve

**F1 Score vs Confidence**

F1 combines Precision and Recall:

```text
F1 =
2 × Precision × Recall
----------------------
Precision + Recall
```

The F1 curve can help identify a confidence threshold that provides a good balance between Precision and Recall.

---

# Confidence Threshold

YOLO assigns a confidence score to every detection.

Example:

```text
Mask       0.95
No Mask    0.91
Mask       0.72
Mask       0.43
```

If the threshold is:

```text
0.50
```

the model accepts:

```text
0.95
0.91
0.72
```

and rejects:

```text
0.43
```

Changing the threshold does not retrain the model.

It only changes which predictions are accepted during inference.

---

# Deployment Considerations

The optimal confidence threshold depends on the application.

For example, in a security system:

```text
Missing a dangerous object
```

may be much worse than:

```text
Generating an additional false alert
```

Therefore, the system may prioritize Recall.

For other applications, excessive false alarms may be more problematic, so higher Precision may be preferred.

This demonstrates an important machine-learning principle:

> **The best model configuration depends not only on metrics, but also on the requirements of the real-world system.**

---

# Real-Time Detection

The trained model was also tested using a live webcam.

The processing pipeline is:

```text
Webcam
   ↓
Frame
   ↓
YOLOv8
   ↓
Detection
   ↓
Bounding Boxes
   ↓
Class + Confidence
   ↓
Display Frame
```

Because a video is a sequence of individual images (frames), YOLO processes the video frame by frame.

Example:

```text
Video
 ↓
Frame 1 → YOLO
Frame 2 → YOLO
Frame 3 → YOLO
Frame 4 → YOLO
...
```

The YOLO framework automatically generates the annotated frame using its plotting functionality.

---

# Inference Example

The trained model can be loaded using:

```python
from ultralytics import YOLO

model = YOLO("path/to/best.pt")
```

A webcam can then be processed frame by frame.

```python
import cv2
from ultralytics import YOLO

model = YOLO("best.pt")

cap = cv2.VideoCapture(0)

while True:

    ret, frame = cap.read()

    if not ret:
        break

    results = model(frame)

    annotated_frame = results[0].plot()

    cv2.imshow("Face Mask Detection", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
```

---

# Project Structure

A simplified project structure is:

```text
Project_06_Face_Mask_Detection/
│
├── README.md
├── requirements.txt
├── data.yaml
├── predict.py
│
├── dataset/
│   ├── train/
│   │   ├── images/
│   │   └── labels/
│   │
│   ├── valid/
│   │   ├── images/
│   │   └── labels/
│   │
│   └── test/
│       ├── images/
│       └── labels/
│
├── runs/
│   └── detect/
│       └── face_mask_v1/
│           └── weights/
│               ├── best.pt
│               └── last.pt
│
└── notebooks/
    └── face_mask_detection.ipynb
```

Large datasets and generated training artifacts may be excluded from Git using `.gitignore`.

---

# Technologies Used

* Python
* YOLOv8
* Ultralytics
* OpenCV
* PyTorch
* NumPy
* Google Colab / CUDA GPU
* Jupyter Notebook

---

#  Running the Project

## 1. Clone the Repository

```bash
git clone <repository-url>
cd Project_06_Face_Mask_Detection
```

---

## 2. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 3. Train the Model

Training is performed using the YOLOv8 framework and the custom dataset.

Example:

```python
from ultralytics import YOLO

model = YOLO("yolov8n.pt")

model.train(
    data="data.yaml",
    epochs=100,
    imgsz=640,
    batch=16,
    name="face_mask_v1"
)
```

The exact training configuration may be adjusted depending on available hardware and dataset size.

---

## 4. Load the Best Model

After training, YOLO saves the best-performing weights.

```text
runs/
└── detect/
    └── face_mask_v1/
        └── weights/
            └── best.pt
```

The `best.pt` model should be used for inference.

---

## 5. Run Webcam Detection

```bash
python predict.py
```

The webcam will display:

* Bounding boxes.
* Class names.
* Confidence scores.

Press:

```text
Q
```

to exit the application.

---

#  Model Evaluation

The project generated several evaluation artifacts, including:

```text
results.png
confusion_matrix.png
confusion_matrix_normalized.png
P_curve.png
R_curve.png
PR_curve.png
F1_curve.png
```

These visualizations were studied to understand:

* Training behavior.
* Validation behavior.
* Class confusion.
* Precision.
* Recall.
* mAP.
* Confidence thresholds.
* Precision/Recall trade-offs.

---

# Key Learning Outcomes

After completing Project 06, I can:

* Prepare a custom object-detection dataset.
* Understand YOLO annotation format.
* Create a YOLO dataset configuration.
* Fine-tune a pretrained YOLOv8 model.
* Train a custom detector.
* Load trained `.pt` weights.
* Perform image inference.
* Perform real-time webcam detection.
* Understand Box Loss.
* Understand Classification Loss.
* Understand DFL Loss.
* Interpret Precision.
* Interpret Recall.
* Interpret mAP50.
* Interpret mAP50-95.
* Analyze a confusion matrix.
* Interpret Precision/Confidence curves.
* Interpret Recall/Confidence curves.
* Interpret Precision/Recall curves.
* Interpret F1/Confidence curves.
* Understand confidence thresholds.
* Evaluate model generalization using unseen data.
* Understand how evaluation metrics influence deployment decisions.

---


# Conclusion

Project 06 moved from simply **using a pretrained object detector** to building and evaluating a **custom object-detection model**.

The project demonstrated the complete workflow:

```text
Dataset
   ↓
Annotation
   ↓
Configuration
   ↓
Training
   ↓
Validation
   ↓
Evaluation
   ↓
Best Model
   ↓
Inference
   ↓
Real-Time Detection
```

The most important lesson is that training a model is only one part of machine learning.

A reliable computer-vision system also requires:

```text
Good Dataset
      +
Correct Annotations
      +
Proper Training
      +
Validation
      +
Evaluation
      +
Threshold Selection
      +
Real-World Testing
```

This project establishes the foundation for developing more advanced custom object-detection systems and eventually integrating computer vision into **GuardianGrid**.
