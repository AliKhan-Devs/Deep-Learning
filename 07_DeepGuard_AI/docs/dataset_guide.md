# DeepGuard AI — Dataset Specification & Leakage Prevention Guide

## 1. Primary Benchmark: FaceForensics++ (FF++)

### 1.1 Dataset Summary
FaceForensics++ is the premier academic benchmark for automated facial manipulation detection. It comprises 1,000 pristine original YouTube video sequences manipulated via four state-of-the-art generation paradigms:
1. **Deepfakes (DF)**: Classical autoencoder-based face replacement.
2. **Face2Face (F2F)**: Computer-graphics facial reenactment transferring source facial expressions onto a target video stream.
3. **FaceSwap (FS)**: Traditional 3D graphics-based landmark fitting and blending.
4. **NeuralTextures (NT)**: GAN-driven facial texture modification modifying mouth interiors and skin surface details.

### 1.2 Compression Variants
- **Raw**: Uncompressed video streams.
- **c23 (Light Compression)**: H.264 encoding with Constant Rate Factor (CRF) 23. This is the **primary recommended training compression level**, mirroring real-world high-definition social media content.
- **c40 (Heavy Compression)**: H.264 encoding with CRF 40, introducing strong block compression artifacts.

### 1.3 Official Academic Access Agreement
FaceForensics++ is distributed exclusively for academic research:
- **Official Terms**: Direct downloads require submitting the FaceForensics Terms of Use agreement to the Technical University of Munich (TUM).
- **Request Form**: [TUM FaceForensics Agreement](https://github.com/ondyari/FaceForensics)
- **Ethical Use**: DeepGuard AI strictly respects non-commercial research licensing.

---

## 2. Cross-Dataset Generalization Benchmark: Celeb-DF (v2)

### 2.1 Dataset Summary
Celeb-DF v2 is an advanced deepfake benchmark containing 5,639 high-quality synthetic videos across 59 celebrity identities, along with 590 original YouTube celebrity videos and 300 YouTube-real sequences.

### 2.2 Role in DeepGuard AI: Zero-Shot Generalization
Models trained on FaceForensics++ often overfit to specific blending boundary masks and video codecs. In DeepGuard AI:
- **Celeb-DF is strictly excluded from training.**
- It serves as an independent zero-shot evaluation benchmark to measure whether the detector has learned genuine facial artifacts or merely memorized dataset-specific quirks.

---

## 3. Critical Data Leakage Prevention Rules

> [!WARNING]
> In deepfake research, improper splitting of video frames is the single largest cause of artificially inflated, false accuracy metrics.

### 3.1 The Frame-Level Splitting Fallacy
Consider original video `042.mp4` and its derived deepfake `042_056.mp4`. Both feature Actor A.
If frames are shuffled randomly across train and test sets:
- The neural network memorizes Actor A's skin tone, eye shape, and lighting.
- The test set evaluates facial identity recognition rather than manipulation artifact detection.
- The model reports 99% test accuracy but fails completely when deployed on real unseen users.

### 3.2 DeepGuard AI's Deterministic Identity Partitioning
In `training/src/datasets/faceforensics.py`:
1. Every video is mapped to its root `source_id` (e.g., `042_056` -> `source_id = "042"`).
2. All real and manipulated variations sharing `source_id` are grouped into a single unit.
3. Unique `source_id`s are partitioned using a deterministic random seed (42):
   - **Train**: 70% of identities
   - **Validation**: 15% of identities
   - **Test**: 15% of identities
4. Set intersection assertions guarantee:
   $$\text{Train Identities} \cap \text{Val Identities} = \emptyset$$
   $$\text{Train Identities} \cap \text{Test Identities} = \emptyset$$
