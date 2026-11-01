# DeepGuard AI — Forensic Evaluation & Metrics Guide

## 1. Core Forensic Classification Metrics

In digital forensics, accuracy alone is inadequate because class distribution and asymmetric error costs strongly dictate real-world suitability:

### 1.1 Precision
$$\text{Precision} = \frac{\text{True Positives (TP)}}{\text{True Positives (TP)} + \text{False Positives (FP)}}$$
*Forensic Meaning:* When the model flags an image as a deepfake, how often is it truly manipulated? High precision prevents innocent authentic media from being falsely labeled as forged.

### 1.2 Recall (Sensitivity)
$$\text{Recall} = \frac{\text{True Positives (TP)}}{\text{True Positives (TP)} + \text{False Negatives (FN)}}$$
*Forensic Meaning:* Of all actual deepfakes in the stream, what percentage did the system successfully catch? High recall prevents malicious forgeries from slipping through undetected.

### 1.3 Specificity (True Negative Rate)
$$\text{Specificity} = \frac{\text{True Negatives (TN)}}{\text{True Negatives (TN)} + \text{False Positives (FP)}}$$
*Forensic Meaning:* The rate of correctly confirming pristine, unmanipulated videos.

### 1.4 False Alarm Rate (FAR / FPR)
$$\text{FAR} = \frac{\text{FP}}{\text{FP} + \text{TN}} = 1 - \text{Specificity}$$
Critical in digital forensics to ensure legal confidence before presenting analysis evidence.

### 1.5 Area Under the ROC Curve (ROC-AUC)
Measures the detector's discriminative ability across all possible classification decision thresholds (from 0.0 to 1.0). An AUC of 1.0 indicates perfect class separability, while 0.50 denotes random guessing.

---

## 2. In-Domain vs. Cross-Dataset Generalization

| Metric Target | FaceForensics++ (Test Set) | Celeb-DF v2 (Zero-Shot) |
|---|---|---|
| **Role** | In-domain validation on unseen actors | Out-of-domain generalization test |
| **Expected Behavior** | High scores (e.g., AUC > 0.90) | Expected drop due to novel synthesis techniques |
| **Forensic Implication** | Proves model learned training domain artifacts | Proves model generalizes to unseen deepfake generation algorithms |

---

## 3. Inference Latency & Hardware Throughput

Measured via `training/src/evaluation/metrics.py:benchmark_latency`:
- **Warmup Iterations**: 10 runs to stabilize CUDA kernels / CPU caches.
- **Timed Iterations**: 50 forward passes recording:
  - Mean Latency (ms)
  - 95th Percentile Latency ($P_{95}$ ms)
  - Throughput (Frames Per Second / FPS)
