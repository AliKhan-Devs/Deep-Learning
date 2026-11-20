import os
import io
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ready"
    assert "YOLOv26s" in data["champion_model"]

def test_system_status():
    resp = client.get("/api/v1/system/status")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "online"
    assert "no_mask" in data["supported_classes"]
    assert "mask" in data["supported_classes"]

def test_system_models():
    resp = client.get("/api/v1/system/models")
    assert resp.status_code == 200
    data = resp.json()
    assert "models" in data
    assert len(data["models"]) == 3
    assert data["recommended_model"] == "v3"

def test_experiments_comparison():
    resp = client.get("/api/v1/experiments/comparison")
    assert resp.status_code == 200
    data = resp.json()
    assert data["champion_id"] == "v3"
    assert len(data["experiments"]) == 3

def test_detect_samples_list():
    resp = client.get("/api/v1/detect/samples")
    assert resp.status_code == 200
    data = resp.json()
    assert "samples" in data
    assert len(data["samples"]) > 0

def test_detect_image_upload():
    # Use one of the sample images
    sample_file = "06_Face_Mask_Detection/backend/samples/01_sample_crowd_compliance.jpg"
    if os.path.exists(sample_file):
        with open(sample_file, "rb") as f:
            file_bytes = f.read()
        resp = client.post(
            "/api/v1/detect/image",
            files={"file": ("test.jpg", io.BytesIO(file_bytes), "image/jpeg")},
            data={"conf_threshold": "0.35", "model_id": "v3"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "annotated_image" in data
        assert "compliance_rate" in data
        assert data["model_used"] == "v3"

def test_compare_all_models():
    sample_file = "06_Face_Mask_Detection/backend/samples/01_sample_crowd_compliance.jpg"
    if os.path.exists(sample_file):
        with open(sample_file, "rb") as f:
            file_bytes = f.read()
        resp = client.post(
            "/api/v1/detect/compare-all",
            files={"file": ("test.jpg", io.BytesIO(file_bytes), "image/jpeg")},
            data={"conf_threshold": "0.35"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "results" in data
        assert len(data["results"]) == 3
        # Check that FPS and latency are present in each model's result
        for m_res in data["results"]:
            assert "fps" in m_res
            assert "inference_time_ms" in m_res
            assert "annotated_image" in m_res
