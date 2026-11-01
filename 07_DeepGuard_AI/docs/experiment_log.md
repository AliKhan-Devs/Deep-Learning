# DeepGuard AI — Experiment Tracking & Benchmark Log

> [!NOTE]
> In accordance with project integrity standards, result values remain unpopulated until actual experiments are conducted on Google Colab GPU runtimes. Never fabricate accuracy numbers.

---

## 1. Planned Experiment Matrix

| Experiment ID | Architecture | Dataset Split | Resolution | Batch Size | Learning Rate | Status |
|---|---|---|---|---|---|---|
| `EXP-001` | EfficientNet-B0 | FF++ c23 (70/15/15) | 224 × 224 | 32 | $1 \times 10^{-4}$ | Pending Colab Run |
| `EXP-002` | XceptionNet | FF++ c23 (70/15/15) | 299 × 299 | 32 | $2 \times 10^{-4}$ | Pending Colab Run |
| `EXP-003` | EfficientNet-B0 | Celeb-DF v2 Zero-Shot | 224 × 224 | 32 | Evaluation Only | Pending EXP-001 |
| `EXP-004` | XceptionNet | Celeb-DF v2 Zero-Shot | 299 × 299 | 32 | Evaluation Only | Pending EXP-002 |

---

## 2. In-Domain Results Log (FaceForensics++ c23 Test Split)

| Architecture | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Latency (CPU) | Latency (GPU) |
|---|---|---|---|---|---|---|---|
| **EfficientNet-B0** | *Pending* | *Pending* | *Pending* | *Pending* | *Pending* | *Pending* | *Pending* |
| **XceptionNet** | *Pending* | *Pending* | *Pending* | *Pending* | *Pending* | *Pending* | *Pending* |

---

## 3. Cross-Dataset Generalization Results Log (Celeb-DF v2)

| Architecture | Source Dataset | Target Dataset | Test Accuracy | Test F1 | Test ROC-AUC | Performance Delta ($\Delta$ AUC) |
|---|---|---|---|---|---|---|
| **EfficientNet-B0** | FF++ c23 | Celeb-DF v2 | *Pending* | *Pending* | *Pending* | *Pending* |
| **XceptionNet** | FF++ c23 | Celeb-DF v2 | *Pending* | *Pending* | *Pending* | *Pending* |

---

## 4. Hardware Environment Log
- Cloud Platform: Google Colab
- Cloud Accelerator: NVIDIA T4 / V100 GPU (16 GB VRAM)
- Local Host Environment: Windows 11, Intel Core / AMD Ryzen, Python 3.14 / 3.11
