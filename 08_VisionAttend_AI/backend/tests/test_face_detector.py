import numpy as np
from app.services.face_detector import face_detector


def test_face_detector_empty_image():
    res = face_detector.detect_and_crop(None)
    assert res == []

    empty_arr = np.zeros((0, 0, 3), dtype=np.uint8)
    res2 = face_detector.detect_and_crop(empty_arr)
    assert res2 == []


def test_face_detector_blank_canvas():
    blank = np.zeros((300, 300, 3), dtype=np.uint8)
    res = face_detector.detect_and_crop(blank)
    assert isinstance(res, list)
    assert len(res) == 0
