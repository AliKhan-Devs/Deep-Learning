# DeepGuard AI — REST API Specification

**Base API Path:** `/api/v1`

---

## 1. Analysis Endpoints

### 1.1 Analyze Image
- **Endpoint:** `POST /api/v1/analysis/image`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file`: Binary image file (JPG, JPEG, PNG, max 15MB).
  - `model_name`: Form text parameter (defaults to champion `efficientnet_b4`; also accepts `xception` or `efficientnet_b0`).
- **Response (200 OK):**
```json
{
  "analysis_id": "c71a3d92-298e-4a6f-b2b9-e13f416d5570",
  "created_at": "2026-11-20T14:50:00Z",
  "media_type": "image",
  "original_filename": "interview_suspect.jpg",
  "model_name": "efficientnet_b4",
  "status": "COMPLETED",
  "prediction": "Likely Manipulated",
  "fake_probability": 0.9824,
  "real_probability": 0.0176,
  "faces_detected_count": 1,
  "faces": [
    {
      "face_index": 0,
      "bbox": {"x": 120, "y": 80, "w": 160, "h": 160},
      "expanded_bbox": {"x1": 80, "y1": 40, "x2": 320, "y2": 280},
      "fake_probability": 0.9824,
      "real_probability": 0.0176,
      "predicted_label": "FAKE",
      "confidence": 0.9824,
      "model_score": 0.9824
    }
  ],
  "execution_duration_sec": 0.038,
  "disclaimer": "This result is an AI-generated forensic assessment and is not definitive proof of media authenticity or manipulation."
}
```

---

### 1.2 Compare All 3 Models (Arena)
- **Endpoint:** `POST /api/v1/analysis/compare`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file`: Binary image file (JPG, JPEG, PNG, max 15MB).
- **Description:** Evaluates the uploaded image across all three models simultaneously, returning latency (ms), FPS, and confidence side-by-side.
- **Response (200 OK):**
```json
{
  "analysis_id": "8d3e210a-6e21-4f11-80a9-192a83f98c41",
  "created_at": "2026-11-20T14:55:00Z",
  "original_filename": "comparison_test.jpg",
  "faces_detected_count": 1,
  "champion_model": "efficientnet_b4",
  "models": [
    {
      "model_name": "efficientnet_b4",
      "display_name": "EfficientNet-B4 Deepfake Detector (Champion)",
      "architecture": "efficientnet_b4",
      "is_champion": true,
      "latency_ms": 28.4,
      "fps": 35.2,
      "prediction": "Likely Manipulated",
      "fake_probability": 0.9875,
      "real_probability": 0.0125,
      "confidence": 0.9875,
      "face_detected": true,
      "faces_count": 1
    },
    {
      "model_name": "efficientnet_b0",
      "display_name": "EfficientNet-B0 Deepfake Detector",
      "architecture": "efficientnet_b0",
      "is_champion": false,
      "latency_ms": 11.2,
      "fps": 89.3,
      "prediction": "Likely Manipulated",
      "fake_probability": 0.9240,
      "real_probability": 0.0760,
      "confidence": 0.9240,
      "face_detected": true,
      "faces_count": 1
    },
    {
      "model_name": "xception",
      "display_name": "XceptionNet Deepfake Detector",
      "architecture": "xception",
      "is_champion": false,
      "latency_ms": 34.6,
      "fps": 28.9,
      "prediction": "Likely Manipulated",
      "fake_probability": 0.9510,
      "real_probability": 0.0490,
      "confidence": 0.9510,
      "face_detected": true,
      "faces_count": 1
    }
  ]
}
```

---

### 1.3 Analyze Video (Asynchronous)
- **Endpoint:** `POST /api/v1/analysis/video`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file`: Binary video file (MP4, MOV, AVI, max 150MB).
  - `model_name`: Form text parameter (defaults to `efficientnet_b4`).
- **Response (200 OK):**
```json
{
  "analysis_id": "908d18e2-f472-43bb-815f-c917cb8340d1",
  "status": "PENDING",
  "message": "Video accepted and queued for frame-level extraction and analysis.",
  "poll_url": "/api/v1/analysis/908d18e2-f472-43bb-815f-c917cb8340d1"
}
```

---

### 1.4 Poll Video Analysis Status / Fetch Results
- **Endpoint:** `GET /api/v1/analysis/{analysis_id}`
- **Response (200 OK):**
```json
{
  "analysis_id": "908d18e2-f472-43bb-815f-c917cb8340d1",
  "created_at": "2026-11-20T14:52:10Z",
  "media_type": "video",
  "original_filename": "video_clip.mp4",
  "model_name": "efficientnet_b4",
  "status": "COMPLETED",
  "progress_pct": 100,
  "prediction": "Likely Manipulated",
  "fake_probability": 0.9615,
  "real_probability": 0.0385,
  "frames_analyzed": 28,
  "frames_with_faces": 28,
  "suspicious_frames_count": 26,
  "execution_duration_sec": 4.12,
  "timeline": [
    {
      "frame_index": 0,
      "timestamp_sec": 0.0,
      "thumbnail_url": null,
      "faces_count": 1,
      "fake_probability": 0.9411,
      "real_probability": 0.0589,
      "is_suspicious": true,
      "face_boxes": [{"x": 140, "y": 60, "w": 120, "h": 120}]
    }
  ],
  "disclaimer": "This result is an AI-generated forensic assessment and is not definitive proof of media authenticity or manipulation."
}
```

---

## 2. Models & Benchmark Endpoints

### 2.1 List Models
- **Endpoint:** `GET /api/v1/models`
- **Response:** Returns metadata, architecture, input resolution, and `checkpoint_exists` readiness status for all 3 supported models.

### 2.2 Get Model Benchmarks
- **Endpoint:** `GET /api/v1/models/benchmarks`
- **Response:** Returns comparative metrics table (Accuracy, ROC-AUC, Fake Recall, Missed Fakes, Min Val Loss) and diagnostic image URLs for all 3 experimental models.

### 2.3 System Status
- **Endpoint:** `GET /api/v1/system/status`
- **Response:** Returns host device (`cuda` or `cpu`), version, total stored analyses, and model readiness summary.
