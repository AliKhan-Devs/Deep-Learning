# DeepGuard AI — Troubleshooting & Common Issues

## 1. Missing Model Checkpoints (`HTTP 422 Unprocessable Entity`)

### Symptoms
When requesting `/api/v1/analysis/image` or `/api/v1/analysis/video`, the API returns:
```json
{
  "error_type": "CHECKPOINT_MISSING",
  "message": "Trained checkpoint weights for 'efficientnet_b0' are not found...",
  "instructions": "Please open the corresponding Google Colab training notebook..."
}
```

### Cause
The local application requires genuine trained weights and **never** returns simulated fake predictions. You have not yet downloaded `best_model.pth` from Colab into the local directory.

### Resolution
1. Open `training/notebooks/03_efficientnet_training.ipynb` in Google Colab.
2. Run training on GPU and execute the export cell.
3. Download `best_model.pth`.
4. Place into: `07_DeepGuard_AI/backend/artifacts/models/efficientnet_b0/best_model.pth`
5. Refresh the UI; the model status badge switches to **Ready**.

---

## 2. Video Fails to Open (`cv2.VideoCapture` Error)

### Symptoms
`VideoProcessingError: OpenCV failed to open video file` or total frame count reports 0.

### Cause
Missing system video codecs (specifically H.264/AAC for MP4 containers) on Linux or minimal Docker environments.

### Resolution
- Install FFmpeg system libraries:
  ```bash
  # Debian / Ubuntu
  sudo apt-get update && sudo apt-get install -y ffmpeg libgl1
  ```
- In Docker, ensure the base image installs `ffmpeg` and `libgl1` (already included in `backend/Dockerfile`).

---

## 3. CUDA Out of Memory (OOM) during Colab Training

### Symptoms
`RuntimeError: CUDA out of memory. Tried to allocate...`

### Resolution
1. In Colab, reduce the batch size from 32 to 16:
   ```python
   BATCH_SIZE = 16
   ```
2. Ensure Automatic Mixed Precision is active:
   ```python
   scaler = torch.amp.GradScaler('cuda', enabled=True)
   ```
3. Restart Colab runtime via **Runtime > Restart session** to free fragmented VRAM.

---

## 4. Frontend Cannot Connect to Backend (`API Offline`)

### Symptoms
The status indicator in the top navbar displays `API Offline`.

### Cause
Backend server is not running on port 8000, or CORS origin is blocked.

### Resolution
1. Verify backend is running:
   ```bash
   curl http://localhost:8000/api/v1/health
   # Expected: {"status": "HEALTHY", "service": "DeepGuard AI", ...}
   ```
2. Verify port configuration in `frontend/.env.local` or environment variable:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```
