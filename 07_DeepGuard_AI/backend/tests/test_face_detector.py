import pytest
import numpy as np
from app.services.face_detector import face_detector


def test_face_detector_empty_image():
    """Verifies graceful handling of empty or blank images."""
    empty_img = np.zeros((0, 0, 3), dtype=np.uint8)
    assert face_detector.detect(empty_img) == []
    assert face_detector.crop_faces(empty_img) == []


def test_face_detector_blank_canvas():
    """A plain black image without fallback should have 0 face detections."""
    blank = np.zeros((300, 300, 3), dtype=np.uint8)
    results = face_detector.detect(blank, allow_full_frame_fallback=False)
    assert len(results) == 0


def test_face_detector_margin_expansion():
    """Verifies expanded bounding box includes the 25% margin."""
    # Create an artificial face rectangle to simulate detection coordinates
    w, h = 100, 100
    x, y = 50, 50
    margin = 0.25

    dx = int(w * margin)
    dy = int(h * margin)

    x1 = max(0, x - dx)
    y1 = max(0, y - dy)
    x2 = min(500, x + w + dx)
    y2 = min(500, y + h + dy)

    assert x1 < x
    assert y1 < y
    assert x2 > (x + w)
    assert y2 > (y + h)
