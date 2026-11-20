# NeuroScan XAI: Explainable Deep Learning Framework for Brain MRI Tumor Diagnosis

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Model](https://img.shields.io/badge/Architecture-DenseNet--121-blue)](https://pytorch.org/hub/pytorch_vision_densenet/)
[![Accuracy](https://img.shields.io/badge/Test%20Accuracy-95.56%25-emerald)](https://github.com/AliKhan-Devs/Deep-Learning)
[![XAI](https://img.shields.io/badge/XAI-Grad--CAM%20%2B%20Grad--CAM%2B%2B-purple)](https://arxiv.org/abs/1610.02391)
[![Tests](https://img.shields.io/badge/Tests-17%20Passed-brightgreen)](https://pytest.org/)

![Test image of brain tumor detection](./assets/test_image_2.png)

**NeuroScan XAI** is an interpretable clinical computer vision system for **multi-class brain tumor classification, weakly-supervised lesion localization, and diagnostic uncertainty quantification** from magnetic resonance imaging (MRI) scans. Engineered for high-stakes medical diagnosis where uninterpretable "black-box" models are unacceptable, it pairs high-capacity feature extraction (**DenseNet-121**, achieving **95.56% test accuracy**) with native **Grad-CAM**, **Grad-CAM++**, and **Shannon Softmax Entropy** clinical safety triage.

---

## 1. Verified Clinical Evaluation & Test Results

The fine-tuned DenseNet-121 checkpoint was evaluated on **1,600 unseen test MRI scans** across 4 balanced classes (400 scans per class).

### 1.1 Independent Test Classification Report
| Pathology Class | Precision (PPV) | Recall (Sensitivity) | F1-Score | Test Support |
| :--- | :---: | :---: | :---: | :---: |
| **Glioma** | **1.0000** | 0.8300 | 0.9071 | 400 |
| **Meningioma** | 0.9025 | **0.9950** | 0.9465 | 400 |
| **No Tumor (Healthy)** | 0.9412 | **1.0000** | **0.9697** | 400 |
| **Pituitary Adenoma** | **0.9925** | **0.9975** | **0.9950** | 400 |
| **OVERALL ACCURACY** | &mdash; | &mdash; | **95.56%** | **1,600** |
| **Macro Average** | **0.9591** | **0.9556** | **0.9546** | 1,600 |

### 1.2 Quantitative Visual Evidence
| Normalized Confusion Matrix | Multi-Class One-vs-Rest ROC Curves |
| :---: | :---: |
| ![Confusion Matrix](./assets/confusion_matrix.png) | ![ROC Curves](./assets/roc_curves.png) |
| *Strong diagonal dominance with minimal inter-class confusion.* | *Near-ideal ROC separation (AUC &gt; 0.98 across all pathologies).* |

| Training & Validation Loss/Accuracy Dynamics | Multi-Panel Explainable AI Attribution Validation |
| :---: | :---: |
| ![Training Dynamics](./assets/training_dynamics.png) | ![XAI Saliency Evaluation](./assets/xai_saliency_evaluation.png) |
| *Stable convergence with CosineAnnealingLR & mixed precision.* | *DenseBlock4 feature activations isolating focal tumor borders.* |

---

## 2. Clinical Scope & Diagnostic Classes

The framework delivers 4-way differential diagnosis on cranial axial, coronal, and sagittal T1/T2-weighted MRI scans:

1. **Glioma (Malignant Intra-Axial):** Infiltrative parenchymal tumor arising from glial support cells (astrocytomas, glioblastomas). Characterized by irregular margins, necrotic foci, and surrounding vasogenic edema.
2. **Meningioma (Extra-Axial):** Typically benign neoplasm arising from arachnoid cap cells. Characterized by broad dural attachment ("dural tail" sign), sharp cortical boundaries, and homogeneous enhancement.
3. **Pituitary Adenoma (Sellar/Suprasellar):** Endocrine tumor arising within the sella turcica, often exerting upward mass effect on the optic chiasm.
4. **No Tumor (Normal Physiological Anatomy):** Intact bilateral symmetry, normal ventricular dimensions, preserved gray-white matter differentiation, and absence of pathological mass effect.

---

## 3. System Architecture

```mermaid
flowchart TD
    subgraph Client["Next.js 14 Radiologist PACS Workstation"]
        Gallery["1-Click Demo Gallery (Glioma, Meningioma, Pituitary, Normal)"]
        Dropzone["DICOM / MRI Upload Dropzone"]
        Viewport["Dual-Pane Radiologist Viewport (Alpha-Blend Scrubbing)"]
        DiagnosticHUD["Diagnostic Triage Card (Probabilities & Shannon Entropy)"]
        EvidenceHub["Model Evidence & Validation Hub (/evidence)"]
        AuditTrail["Audit Log & History Explorer (/history)"]
    end

    subgraph CoreEngine["FastAPI Inference & XAI Microservice (Port 8002)"]
        Preprocess["Clinical Preprocessor (224x224 & ImageNet Norm)"]
        Backbone["DenseNet-121 Feature Backbone (DenseBlocks 1-4)"]
        Classifier["Diagnostic Classification Head (Dropout + Linear)"]
        Softmax["Differential Softmax Vector P(c)"]
        GradCAM["Grad-CAM Saliency Engine (DenseBlock4 Gradients)"]
        GradCAMPP["Grad-CAM++ High-Order Derivative Engine"]
        Entropy["Shannon Entropy Uncertainty Assessor H(p)"]
        Contours["Weakly-Supervised Tumor Contour Extractor"]
    end

    subgraph Storage["Persistence Layer"]
        DB[("SQLite Database: neuroscan_audit.db")]
        Artifacts["Trained Checkpoints: best_densenet121.pth"]
    end

    Gallery -->|"Instant Analysis Request"| Preprocess
    Dropzone -->|"Uploaded Scan Stream"| Preprocess
    Preprocess -->|"Normalized Tensor"| Backbone
    Backbone -->|"Feature Maps A^k"| Classifier
    Classifier -->|"Logits Y^c"| Softmax
    Softmax -->|"Class Probabilities"| Entropy
    Backbone -->|"Activations & Backprop Gradients"| GradCAM
    Backbone -->|"High-Order Derivatives"| GradCAMPP
    GradCAM -->|"Coarse Saliency Map"| Viewport
    GradCAMPP -->|"Fine Structure Attention"| Viewport
    GradCAMPP -->|"Thresholded Saliency"| Contours
    Contours -->|"Bounding Box Coordinates"| Viewport
    Softmax -->|"Differential Probabilities"| DiagnosticHUD
    Entropy -->|"Uncertainty Safety Rating"| DiagnosticHUD
    DiagnosticHUD -->|"Record Case Assessment"| DB
    DB --> AuditTrail
```

---

## 4. Mathematical Foundations

### 4.1 DenseNet-121 Feature Reuse
Unlike standard residual architectures that combine feature maps via summation ($x + f(x)$), DenseNet concatenates all preceding feature representations:
$$x_\ell = H_\ell([x_0, x_1, \dots, x_{\ell-1}])$$
This preserves fine-grained spatial textures (such as meningeal borders and micro-necrosis) into the final convolutional layer (`features.denseblock4`), producing sharp localization maps without gradient decay.

### 4.2 Grad-CAM Mathematical Formulation
Given class score $Y^c$ for tumor pathology $c$, gradients are backpropagated to feature map $A^k$ of the last convolutional block:
$$\alpha_k^c = \frac{1}{Z} \sum_{i=1}^U \sum_{j=1}^V \frac{\partial Y^c}{\partial A_{i,j}^k}$$
$$L_{\text{Grad-CAM}}^c = \text{ReLU}\left( \sum_k \alpha_k^c A^k \right)$$

### 4.3 Grad-CAM++ (Second & Third Order Derivatives)
For diffuse glial tumors or multi-focal presentations, Grad-CAM++ weights gradients per-pixel using higher-order partial derivatives:
$$w_k^c = \sum_{i=1}^U \sum_{j=1}^V \alpha_{i,j}^{kc} \cdot \text{ReLU}\left( \frac{\partial Y^c}{\partial A_{i,j}^k} \right)$$
where $\alpha_{i,j}^{kc}$ are calculated analytically from $\frac{\partial^2 Y^c}{\partial (A_{i,j}^k)^2}$ and $\frac{\partial^3 Y^c}{\partial (A_{i,j}^k)^3}$.

### 4.4 Diagnostic Uncertainty (Shannon Softmax Entropy)
To safeguard against clinical false positives on borderline or atypical scans, predictive entropy is calculated:
$$H(p) = -\sum_{c=1}^4 p_c \log_2(p_c + \epsilon), \quad H(p) \in [0, 2.0]$$
* **$H(p) < 0.40$:** High diagnostic certainty &rarr; Automated preliminary triage.
* **$0.40 \le H(p) < 0.85$:** Moderate uncertainty &rarr; Standard secondary review advised.
* **$H(p) \ge 0.85$:** High diagnostic ambiguity &rarr; Mandatory senior specialist review.

---

## 5. REST API Specification

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/v1/inference/analyze` | `POST` | Upload an MRI scan for full inference, Grad-CAM/Grad-CAM++ heatmap generation, and entropy scoring. |
| `/api/v1/inference/sample-scans` | `GET` | Retrieve the gallery of 4 bundled genuine clinical sample scans. |
| `/api/v1/inference/analyze-sample/{id}` | `POST` | Trigger instant 1-click evaluation of a sample scan (`glioma`, `meningioma`, `pituitary`, `notumor`). |
| `/api/v1/history/list` | `GET` | Query past diagnostic cases, confidence scores, entropy ratings, and timestamps. |
| `/api/v1/history/clear` | `DELETE` | Clear all saved case audit records. |
| `/api/v1/system/status` | `GET` | Core runtime diagnostics, hardware accelerator status, and verified validation accuracy. |
| `/api/v1/system/classes-info` | `GET` | Anatomical descriptions, origin tissue, and radiological hallmarks for all 4 classes. |

---

## 6. Local Setup & Execution Guide

### Prerequisites
* Python 3.10+
* Node.js 18+ and npm

### Step 1: Backend Setup & Testing
```powershell
cd 09_NeuroScan_XAI/backend

# Run the automated pytest suite (17 passed in ~2.9s)
pytest tests -v

# Start the FastAPI engine (runs on port 8002)
uvicorn app.main:app --host 127.0.0.1 --port 8002 --reload
```
Interactive Swagger API documentation: `http://127.0.0.1:8002/docs`

### Step 2: Frontend Setup
```powershell
cd 09_NeuroScan_XAI/frontend

# Build the Next.js production bundle
npm run build

# Start the PACS Radiologist Workstation (runs on port 3002)
npm run start
```
Open `http://localhost:3002` in your browser.

---

## 7. Master Google Colab Training Notebook

If you wish to re-train or experiment with the model on Google Colab:
1. Open [`09_NeuroScan_XAI/notebooks/01_neuroscan_xai_brain_tumor_training.ipynb`](./notebooks/01_neuroscan_xai_brain_tumor_training.ipynb) in [Google Colab](https://colab.research.google.com/).
2. Select **Runtime &rarr; Change runtime type &rarr; T4 GPU**.
3. Run all cells:
   - Downloads the dataset (~150 MB) automatically in under 15 seconds via `kagglehub`.
   - Trains DenseNet-121 in ~13 minutes with mixed precision (`fp16`).
   - Automatically packages and downloads `best_densenet121.pth` and `model_metadata.json`.

---

## 8. Portfolio Learning Progression

- **Project 01-04:** CNN architectures, Regularization, and Transfer Learning with ResNet18.
- **Project 05-06:** Real-time Object Detection with YOLOv8 & Face Mask Detection.
- **Project 07 (DeepGuard AI):** Temporal Deepfake Video Authentication & Inconsistency Analysis.
- **Project 08 (VisionAttend AI):** Deep Metric Learning, 512-D FaceNet Centroids & SaaS Reception Kiosk.
- **Project 09 (NeuroScan XAI):** **Explainable Deep Learning in Computational Neuroradiology, DenseNet-121 Feature Reuse, Grad-CAM++, Weakly-Supervised ROI Contouring, and Shannon Entropy Clinical Safety Triage.**
