import numpy as np
import torch
from app.services.model_service import model_service
from app.services.xai_service import XAIEngine

def test_gradcam_generation():
    dummy_input = torch.randn(1, 3, 224, 224).to(model_service.device)
    cam = model_service.xai_engine.compute_gradcam(dummy_input, target_class_idx=0)
    assert cam.shape == (224, 224)
    assert cam.min() >= 0.0
    assert cam.max() <= 1.0 + 1e-6

def test_gradcam_plus_plus_generation():
    dummy_input = torch.randn(1, 3, 224, 224).to(model_service.device)
    cam_pp = model_service.xai_engine.compute_gradcam_plus_plus(dummy_input, target_class_idx=1)
    assert cam_pp.shape == (224, 224)
    assert cam_pp.min() >= 0.0
    assert cam_pp.max() <= 1.0 + 1e-6

def test_overlay_rendering():
    dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
    dummy_cam = np.ones((224, 224), dtype=np.float32) * 0.5
    overlay = XAIEngine.render_overlay(dummy_img, dummy_cam, alpha=0.5)
    assert overlay.shape == (224, 224, 3)
    assert overlay.dtype == np.uint8

def test_tumor_contours_extraction():
    dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
    # Create synthetic circle activation
    dummy_cam = np.zeros((224, 224), dtype=np.float32)
    dummy_cam[80:140, 80:140] = 0.9
    overlay, bboxes = XAIEngine.extract_tumor_contours(dummy_img, dummy_cam, threshold=0.5)
    assert overlay.shape == (224, 224, 3)
    assert len(bboxes) >= 1
    assert bboxes[0].w > 0 and bboxes[0].h > 0
