import os
import pytest
import cv2
import numpy as np
from app.services.detector_service import detector_service
from app.config import settings

def test_detector_service_initialization():
    assert detector_service is not None
    assert "v3" in detector_service.model_configs
    assert detector_service.active_model_id == "v3"
    assert settings.DEFAULT_MODEL_ID == "v3"

def test_detector_model_loading():
    model = detector_service.get_model("v3")
    assert model is not None
    assert hasattr(model, "predict")

def test_detector_image_inference():
    # Create synthetic test image (640x640 with some color)
    dummy_img = np.zeros((480, 640, 3), dtype=np.uint8)
    # Add a mock face-like oval
    cv2.circle(dummy_img, (320, 240), 80, (200, 200, 200), -1)
    _, buffer = cv2.imencode(".jpg", dummy_img)
    img_bytes = buffer.tobytes()

    result = detector_service.detect_image(
        image_bytes=img_bytes,
        conf_threshold=0.3,
        model_id="v3"
    )

    assert "model_used" in result
    assert result["model_used"] == "v3"
    assert "annotated_image" in result
    assert result["annotated_image"].startswith("data:image/jpeg;base64,")
    assert "total_faces" in result
    assert "compliance_rate" in result
    assert "inference_time_ms" in result
    assert isinstance(result["detections"], list)

def test_detector_sample_inference():
    sample_path = os.path.join(settings.PROJECT_DIR, "backend", "samples", "01_sample_crowd_compliance.jpg")
    if os.path.exists(sample_path):
        with open(sample_path, "rb") as f:
            bytes_data = f.read()
        res = detector_service.detect_image(bytes_data, conf_threshold=0.3, model_id="v3")
        assert res["image_dimensions"]["width"] > 0
        assert res["total_faces"] >= 0
