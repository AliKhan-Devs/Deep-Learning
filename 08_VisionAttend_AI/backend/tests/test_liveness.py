import numpy as np
from app.services.liveness_detector import liveness_detector
from app.config import settings


def test_liveness_empty_face():
    res = liveness_detector.check_liveness(None)
    assert res["is_live"] is False
    assert res["score"] == 0.0


def test_liveness_disabled_toggle():
    original = settings.LIVENESS_ENABLED
    try:
        settings.LIVENESS_ENABLED = False
        res = liveness_detector.check_liveness(np.zeros((160, 160, 3), dtype=np.uint8))
        assert res["is_live"] is True
    finally:
        settings.LIVENESS_ENABLED = original


def test_liveness_texture_gradient():
    # Textured noisy image
    face = (np.random.rand(160, 160, 3) * 255).astype(np.uint8)
    res = liveness_detector.check_liveness(face)
    assert "score" in res
    assert "laplacian_var" in res
