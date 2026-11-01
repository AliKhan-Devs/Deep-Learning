# DeepGuard AI — Complete Google Colab Cloud Training Guide

> [!NOTE]
> This guide provides step-by-step instructions for executing model training on a cloud GPU using Google Colab and downloading the resulting checkpoints to your local machine.

---

## 16-Step Step-by-Step Walkthrough

### Step 1: Open Notebook in Google Colab
1. Navigate to [Google Colab](https://colab.research.google.com/).
2. Click **Upload** and upload `07_DeepGuard_AI/training/notebooks/03_efficientnet_training.ipynb` (or `04_xception_training.ipynb`).

### Step 2: Select a GPU Runtime
1. In Colab, click **Runtime** in the top menu bar.
2. Select **Change runtime type**.
3. Under **Hardware accelerator**, select **T4 GPU** (or A100 if Colab Pro is active).
4. Click **Save**. Verify by running `!nvidia-smi` in the first cell.

### Step 3: Mount Google Drive
```python
from google.colab import drive
drive.mount('/content/drive')
```
This allows Colab to read your dataset and save final model weights directly to Google Drive.

### Step 4: Obtain Dataset Access
1. Request access to FaceForensics++ via the [official TUM agreement](https://github.com/ondyari/FaceForensics).
2. Download the compressed `c23` H.264 video sequences.
3. Place them in your Google Drive under a folder named `FaceForensics++`.

### Step 5: Configure Dataset Root Path
In Notebook 01, configure the dataset root:
```python
DATASET_ROOT = "/content/drive/MyDrive/FaceForensics++"
```

### Step 6: Execute Leak-Free Splitting
Run cells in `01_dataset_exploration.ipynb`. It will scan all real and manipulated sequences, extract `source_id`s, and deterministically partition the identities:
- 70% Train
- 15% Validation
- 15% Test

### Step 7: Sample Video Frames & Extract Faces
Execute `02_video_preprocessing.ipynb`. This samples frames at controlled intervals (every 0.75s) and crops detected faces with a **25% context margin** to capture manipulation boundaries. Pre-extracted crops are saved as JPG images with CSV manifests.

### Step 8: Train EfficientNet-B0
Open and run `03_efficientnet_training.ipynb`:
- Loads ImageNet-pretrained weights.
- Applies Automatic Mixed Precision (`torch.amp.autocast('cuda')`).
- Trains using AdamW optimizer ($\text{lr} = 10^{-4}$) and Cosine Annealing.
- Monitors validation ROC-AUC every epoch.

### Step 9: Train XceptionNet
Open and run `04_xception_training.ipynb`:
- Loads genuine Xception architecture via `timm`.
- Resizes inputs to 299×299 with `[-1, 1]` normalization.
- Trains using AdamW with early stopping.

### Step 10: Evaluate on Test Identities
Run evaluation cells in `05_model_evaluation.ipynb` against the unseen 15% test set:
- Accuracy, Precision, Recall, F1-Score, ROC-AUC.

### Step 11: Cross-Dataset Evaluation on Celeb-DF v2
Evaluate the trained models on Celeb-DF v2 without retraining. This measures zero-shot domain transfer and real-world robustness.

### Step 12: Inspect Forensic Curves
Inspect the generated plots:
- Loss and Accuracy curves (`loss_curves.png`)
- ROC Curve and AUC metric (`roc_curve.png`)
- Forensic Confusion Matrix (`confusion_matrix.png`)

### Step 13: Export Checkpoint & Companion JSON
The notebook exports:
- `best_model.pth`: State dict with optimizer and best validation score metadata.
- `model_config.json`: Metadata defining architecture, input resolution, normalization constants, and decision threshold.

### Step 14: Download Checkpoint to Your Computer
Execute the browser download cell in Colab:
```python
from google.colab import files
files.download('/content/drive/MyDrive/DeepGuard_Models/efficientnet_b0/best_model.pth')
```

### Step 15: Place Downloaded Weights in Local Repository
Move the downloaded `best_model.pth` file into your local project directory:
```text
c:\Users\alikh\Desktop\Extras\Deep-Learning\07_DeepGuard_AI\backend\artifacts\models\efficientnet_b0\best_model.pth
```
(For Xception, place into `.../artifacts/models/xception/best_model.pth`)

### Step 16: Verify Local Inference
Start the backend and frontend:
```bash
# Terminal 1: Backend
cd 07_DeepGuard_AI/backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Frontend
cd 07_DeepGuard_AI/frontend
npm run dev
```
Open `http://localhost:3000`. In the **Models** page, the model status badge will immediately turn to **Ready**!
