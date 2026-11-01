import io
import pytest
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from fastapi.testclient import TestClient

from app.main import app
from app.services.model_manager import model_manager

client = TestClient(app)


def test_health_check_endpoint():
    """Verifies API health probe."""
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert "DeepGuard" in data["service"]


def test_system_status_endpoint():
    """Verifies system info endpoint."""
    res = client.get("/api/v1/system/status")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "models_ready" in data
    assert "models_missing" in data


def test_list_models_endpoint():
    """Verifies model catalog listing."""
    res = client.get("/api/v1/models")
    assert res.status_code == 200
    models = res.json()
    assert len(models) >= 2
    model_names = [m["model_name"] for m in models]
    assert "efficientnet_b0" in model_names
    assert "xception" in model_names


def test_invalid_image_extension_rejected():
    """Verifies rejection of unsupported file types."""
    dummy_text = io.BytesIO(b"not an image")
    res = client.post(
        "/api/v1/analysis/image",
        files={"file": ("test.txt", dummy_text, "text/plain")},
        data={"model_name": "efficientnet_b0"}
    )
    assert res.status_code == 400
    assert "Unsupported image format" in res.json()["message"]


def test_missing_checkpoint_returns_422():
    """
    Crucial requirement: When checkpoint is missing, the API must return 422
    with an explicit message explaining that Colab training must be performed first.
    """
    if not model_manager.is_checkpoint_available("efficientnet_b0"):
        # Create valid dummy image
        img = Image.new("RGB", (100, 100), color="blue")
        img_bytes = io.BytesIO()
        img.save(img_bytes, format="JPEG")
        img_bytes.seek(0)

        res = client.post(
            "/api/v1/analysis/image",
            files={"file": ("test.jpg", img_bytes, "image/jpeg")},
            data={"model_name": "efficientnet_b0"}
        )
        assert res.status_code == 422
        body = res.json()
        assert body["error_type"] == "CHECKPOINT_MISSING"
        assert "Colab" in body["instructions"]


def test_mocked_image_inference_success(monkeypatch):
    """
    Tests end-to-end inference flow using a mocked model to ensure the API schema,
    face cropping, probability calculations, and database recording succeed without real weights.
    """
    class DummyModel(nn.Module):
        def forward(self, x):
            # Returns fixed logits: [REAL: 1.0, FAKE: 3.5] -> High FAKE probability
            batch_size = x.size(0)
            return torch.tensor([[1.0, 3.5]], dtype=torch.float32).repeat(batch_size, 1)

    mock_config = {
        "model_name": "efficientnet_b0",
        "architecture": "efficientnet_b0",
        "input_size": [224, 224],
        "mean": [0.485, 0.456, 0.406],
        "std": [0.229, 0.224, 0.225],
        "decision_threshold": 0.50
    }

    # Monkeypatch get_model to return DummyModel
    monkeypatch.setattr(
        model_manager,
        "get_model",
        lambda name: (DummyModel(), mock_config)
    )

    # Create synthetic image
    img = Image.new("RGB", (200, 200), color="red")
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="JPEG")
    img_bytes.seek(0)

    res = client.post(
        "/api/v1/analysis/image",
        files={"file": ("test_sample.jpg", img_bytes, "image/jpeg")},
        data={"model_name": "efficientnet_b0"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "analysis_id" in data
    assert data["status"] == "COMPLETED"
    assert "disclaimer" in data
