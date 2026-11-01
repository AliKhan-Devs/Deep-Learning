# DeepGuard AI — Training Methodology & Optimization Guide

## 1. Overview of Architectures

DeepGuard AI supports two proven vision backbones for deepfake forensic artifact extraction:

| Feature | EfficientNet-B0 | XceptionNet |
|---|---|---|
| **Base Weight Initialization** | ImageNet-1k (TorchVision) | ImageNet-1k (timm) |
| **Input Resolution** | 224 × 224 × 3 | 299 × 299 × 3 |
| **Primary Convolution Type** | Mobile Inverted Bottleneck (MBConv) | Depthwise Separable Convolutions |
| **Classification Head** | Dropout(0.3) + Linear(1280, 2) | Dropout(0.4) + Linear(2048, 2) |
| **Normalization Mean** | [0.485, 0.456, 0.406] | [0.5, 0.5, 0.5] |
| **Normalization Std** | [0.229, 0.224, 0.225] | [0.5, 0.5, 0.5] |
| **Strength** | Fast CPU latency, lightweight edge capability | Superior sensitivity to high-frequency blending seams |

---

## 2. Optimization Strategy

### 2.1 Loss Function
Cross-Entropy Loss is minimized over binary classes:
$$\mathcal{L} = - \sum_{i=1}^{N} \left[ y_i \log(\hat{y}_i) + (1 - y_i) \log(1 - \hat{y}_i) \right]$$
Where $y_i \in \{0, 1\}$ represents ground truth ($0 = \text{REAL}, 1 = \text{FAKE}$) and $\hat{y}_i$ is the predicted probability for the FAKE class.

### 2.2 Optimizer: AdamW
Decoupled weight decay ($L_2$ regularization) prevents gradient scale distortion in adaptive moment methods:
- Learning Rate: $\eta = 1 \times 10^{-4}$ (EfficientNet-B0) / $2 \times 10^{-4}$ (XceptionNet)
- Weight Decay: $\lambda = 1 \times 10^{-4}$
- Betas: $(0.9, 0.999)$

### 2.3 Learning Rate Scheduling: Cosine Annealing
Cosine annealing smoothly reduces the learning rate from the initial value down to $\eta_{\text{min}} = 1 \times 10^{-6}$:
$$\eta_t = \eta_{\text{min}} + \frac{1}{2}(\eta_{\text{max}} - \eta_{\text{min}})\left(1 + \cos\left(\frac{t}{T_{\text{max}}}\pi\right)\right)$$

### 2.4 Automatic Mixed Precision (AMP)
On CUDA GPUs, `torch.amp.autocast('cuda')` runs forward operations in FP16 while maintaining master weights in FP32. This halves GPU VRAM usage and doubles throughput without loss of accuracy.

### 2.5 Early Stopping
Monitors validation ROC-AUC with patience $P = 4$ epochs. When validation AUC fails to improve by at least $\delta = 10^{-4}$ for 4 consecutive epochs, training terminates and the best historical checkpoint is preserved.
