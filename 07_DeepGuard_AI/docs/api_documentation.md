# DeepGuard AI — REST API Specification

**Base API Path:** `/api/v1`

---

## 1. Analysis Endpoints

### 1.1 Analyze Image
- **Endpoint:** `POST /api/v1/analysis/image`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file`: Binary image file (JPG, JPEG, PNG, max 15MB).
  - `model_name`: Form text parameter (`efficientnet_b0` or `xception`).
- **Response (200 OK):**
```json
{
  "analysis_id": "c71a3d92-298e-4a6f-b2b9-e13f416d5570",
  "created_at": "2026-11-01T14:50:00Z",
  "media_type": "image",
  "original_filename": "interview_suspect.jpg",
  "model_name": "efficientnet_b0",
  "status": "COMPLETED",
  "prediction": "Likely Manipulated",
  "fake_probability": 0.8924,
  "real_probability": 0.1076,
  "faces_detected_count": 1,
  "faces": [
    {
      "face_index": 0,
      "bbox": {"x": 120, "y": 80, "w": 160, "h": 160},
      "expanded_bbox": {"x1": 80, "y1": 40, "x2": 320, "y2": 280},
      "fake_probability": 0.8924,
      "real_probability": 0.1076,
      "predicted_label": "FAKE",
      "confidence": 0.8924,
      "model_score": 0.8924
    }
  ],
  "execution_duration_sec": 0.142,
  "disclaimer": "This result is an AI-generated forensic assessment and is not definitive proof of media authenticity or manipulation."
}
```

### 1.2 Analyze Video (Asynchronous)
- **Endpoint:** `POST /api/v1/analysis/video`
- **Content-Type:** `multipart/form-data`
- **Parameters:**
  - `file`: Binary video file (MP4, MOV, AVI, max 150MB).
  - `model_name`: Form text parameter.
- **Response (200 OK):**
```json
{
  "analysis_id": "908d18e2-f472-43bb-815f-c917cb8340d1",
  "status": "PENDING",
  "message": "Video accepted and queued for frame-level extraction and analysis.",
  "poll_url": "/api/v1/analysis/908d18e2-f472-43bb-815f-c917cb8340d1"
}
```

### 1.3 Poll Analysis Status / Fetch Results
- **Endpoint:** `GET /api/v1/analysis/{analysis_id}`
- **Response (200 OK):**
```json
{
  "analysis_id": "908d18e2-f472-43bb-815f-c917cb8340d1",
  "created_at": "2026-11-01T14:52:10Z",
  "media_type": "video",
  "original_filename": "video_clip.mp4",
  "model_name": "efficientnet_b0",
  "status": "COMPLETED",
  "progress_pct": 100,
  "prediction": "Likely Manipulated",
  "fake_probability": 0.8415,
  "real_probability": 0.1585,
  "frames_analyzed": 28,
  "frames_with_faces": 28,
  "suspicious_frames_count": 8,
  "execution_duration_sec": 4.12,
  "timeline": [
    {
      "frame_index": 0,
      "timestamp_sec": 0.0,
      "thumbnail_url": "/static/thumbnails/908d18e2_frame_0.jpg",
      "faces_count": 1,
      "fake_probability": 0.8211,
      "real_probability": 0.1789,
      "is_suspicious": true,
      "face_boxes": [{"x": 140, "y": 60, "w": 120, "h": 120}]
    }
  ],
  "disclaimer": "This result is an AI-generated forensic assessment and is not definitive proof of media authenticity or manipulation."
}
```

### 1.4 Download Report
- **Endpoint:** `GET /api/v1/analysis/{analysis_id}/report?format=html|json`
- **Response:**
  - `format=html`: Returns styled, printable HTML forensic assessment certificate.
  - `format=json`: Returns comprehensive JSON payload with all frame-level data.

---

## 2. Models & System Endpoints

### 2.1 List Models
- **Endpoint:** `GET /api/v1/models`
- **Response:** Returns metadata, architecture, input size, decision threshold, and `checkpoint_exists` status for each model.

### 2.2 System Status
- **Endpoint:** `GET /api/v1/system/status`
- **Response:** Returns device (`cuda` or `cpu`), version, total stored analyses, and model readiness summary.
