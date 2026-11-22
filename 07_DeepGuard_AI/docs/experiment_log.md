# DeepGuard AI — Experiment Tracking & Benchmark Log

> **Empirical Evaluation Log**: This document records the empirical results, training dynamics, confusion matrices, and ROC-AUC curves from three deep learning experiments evaluated on an unseen test set of **8,938 images** (4,469 Real genuine faces and 4,469 Deepfake manipulated faces).

---

## 1. Executive Summary: Champion Selection

| Experiment ID | Architecture | Resolution | Weights Size | Test Accuracy | ROC-AUC | Fake Recall | Missed Fakes | Min Val Loss | Verdict / Role |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`EXP-001`** | EfficientNet-B0 | 224 × 224 | 16.34 MB | 92.0% | 0.9795 | 92.9% | 316 / 4,469 | 0.175 | Lightweight Edge Baseline |
| **`EXP-002`** | XceptionNet | 299 × 299 | 83.55 MB | 93.0% | 0.9867 | 95.3% | 210 / 4,469 | 0.155 | Classical Benchmark |
| **`EXP-003`** | **EfficientNet-B4** | **380 × 380** | **70.97 MB** | **97.0%** | **0.9968** | **98.2%** | **80 / 4,469** | **0.075** | **🏆 Production Champion** |

### Key Research Findings
1. **62% Reduction in Missed Deepfakes:** EfficientNet-B4 missed only **80** deepfake samples out of 4,469 (98.2% recall), compared to **210** missed by Xception and **316** missed by EfficientNet-B0.
2. **Resolution Scaling Advantage:** Deepfake manipulation boundaries (hairline seams, eye reflections, color blending) are high-frequency signals. Scaling input resolution to **380 × 380** preserves microscopic boundary artifacts that 224 × 224 models smooth over.
3. **Substantially Lower Generalization Error:** Minimum validation loss for EfficientNet-B4 reached **0.075**, more than 50% lower than Xception (0.155) and B0 (0.175).

---

## 2. Detailed Experiment Breakdown

### Experiment 1: EfficientNet-B0 (Edge Baseline)
- **Model Checkpoint:** `artifacts/models/efficientnet_b0/best_model.pth` (16.34 MB)
- **Input Resolution:** 224 × 224 px
- **Architecture:** Compound scaled Mobile Inverted Bottleneck (MBConv)
- **Test Performance (8,938 images):**
  - **Overall Accuracy:** 92.0%
  - **Macro Precision:** 0.92
  - **Macro Recall:** 0.92
  - **Macro F1-Score:** 0.92
  - **ROC-AUC:** 0.9795
  - **Minimum Validation Loss:** 0.175
- **Confusion Matrix:**
  - True Real (TN): 4,035 | False Fake (FP): 434
  - False Real (FN): 316 | True Fake (TP): 4,153
- **Diagnostic Plots:**
  - [Classification Metrics & Confusion Matrix](assets/efficientnet_b0_metrics.png)
  - [Training/Val Loss & ROC-AUC Curve](assets/efficientnet_b0_roc.png)

---

### Experiment 2: XceptionNet (Classical Benchmark)
- **Model Checkpoint:** `artifacts/models/xception/best_model.pth` (83.55 MB)
- **Input Resolution:** 299 × 299 px
- **Architecture:** Depthwise Separable Convolutions (`timm legacy_xception`)
- **Test Performance (8,938 images):**
  - **Overall Accuracy:** 93.0%
  - **Macro Precision:** 0.93
  - **Macro Recall:** 0.93
  - **Macro F1-Score:** 0.93
  - **ROC-AUC:** 0.9867
  - **Minimum Validation Loss:** 0.155
- **Confusion Matrix:**
  - True Real (TN): 4,070 | False Fake (FP): 399
  - False Real (FN): 210 | True Fake (TP): 4,259
- **Diagnostic Plots:**
  - [Classification Metrics & Confusion Matrix](assets/xception_metrics.png)
  - [Training/Val Loss & ROC-AUC Curve](assets/xception_roc.png)

---

### Experiment 3: EfficientNet-B4 (Production Champion 🏆)
- **Model Checkpoint:** `artifacts/models/efficientnet_b4/best_model.pth` (70.97 MB)
- **Input Resolution:** 380 × 380 px
- **Architecture:** EfficientNet-B4 compound depth/width/resolution scaled backbone
- **Test Performance (8,938 images):**
  - **Overall Accuracy:** 97.0% (+4.0% vs Xception, +5.0% vs B0)
  - **Macro Precision:** 0.97
  - **Macro Recall:** 0.97
  - **Macro F1-Score:** 0.97
  - **ROC-AUC:** 0.9968 (Near Flawless)
  - **Minimum Validation Loss:** 0.075
- **Confusion Matrix:**
  - True Real (TN): 4,293 | False Fake (FP): 176
  - False Real (FN): 80 | True Fake (TP): 4,389
- **Diagnostic Plots:**
  - [Classification Metrics & Confusion Matrix](assets/efficientnet_b4_metrics.png)
  - [Training/Val Loss & ROC-AUC Curve](assets/efficientnet_b4_roc.png)

---

## 3. Comparison of Error Rates

In biometric security and forensic verification, false alarms (calling genuine media fake) and false rejections (missing a deepfake) carry asymmetric real-world consequences:

| Metric | EfficientNet-B0 | XceptionNet | EfficientNet-B4 (Champion) |
|---|---|---|---|
| **False Rejection Rate (Missed Deepfakes)** | 7.07% (316 / 4,469) | 4.70% (210 / 4,469) | **1.79% (80 / 4,469)** |
| **False Alarm Rate (Genuine Flagged Fake)** | 9.71% (434 / 4,469) | 8.93% (399 / 4,469) | **3.94% (176 / 4,469)** |
| **Total Test Classification Errors** | 750 / 8,938 (8.39%) | 609 / 8,938 (6.81%) | **256 / 8,938 (2.86%)** |
| **Relative Error Reduction vs Xception** | Baseline (-23.2%) | Baseline (0%) | **+57.9% Error Reduction** |

---

## 4. Hardware Environment Log
- **Cloud Platform:** Google Colab Free / Pro
- **Cloud Accelerator:** NVIDIA T4 GPU (16 GB VRAM)
- **Optimization Strategy:** PyTorch Automatic Mixed Precision (`torch.amp`), AdamW ($\text{lr}=10^{-4}$), Cosine Annealing scheduler
- **Local Deployment Environment:** Windows 11, Python 3.11, PyTorch 2.2+, FastAPI, Next.js 14
