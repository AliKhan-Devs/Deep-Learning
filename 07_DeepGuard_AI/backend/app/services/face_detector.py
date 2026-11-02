import cv2
import numpy as np
from typing import List, Tuple, Dict, Any, Optional
from PIL import Image

from ..config import settings
from ..core.logging import logger
from ..core.exceptions import FaceDetectionError


class BackendFaceDetector:
    """
    Production face detection service.
    Employs OpenCV Haar Cascade with 25% bounding box margin expansion to encompass
    the entire facial contour (forehead hairline, jawline, ears) where deepfake artifacts cluster.
    """

    def __init__(self, margin: float = settings.FACE_CROP_MARGIN, min_face_size: int = 50):
        self.margin = margin
        self.min_face_size = min_face_size
        self.cascade = None

        if hasattr(cv2, "CascadeClassifier") and hasattr(cv2, "data") and hasattr(cv2.data, "haarcascades"):
            cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
            try:
                self.cascade = cv2.CascadeClassifier(cascade_path)
                if self.cascade.empty():
                    logger.warning("OpenCV Haar cascade is empty.")
                    self.cascade = None
            except Exception as e:
                logger.warning(f"Failed to initialize CascadeClassifier: {e}")
                self.cascade = None
        else:
            logger.warning("cv2.CascadeClassifier is not supported in the active OpenCV build.")

    def detect(self, image_np: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detects faces in an RGB image.
        Returns list of bounding boxes and expanded bounding boxes.
        """
        if image_np is None or image_np.size == 0 or self.cascade is None:
            return []

        h_img, w_img = image_np.shape[:2]
        gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)

        flags = getattr(cv2, "CASCADE_SCALE_IMAGE", 0)
        faces = self.cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(self.min_face_size, self.min_face_size),
            flags=flags
        )

        results = []
        for (x, y, w, h) in faces:
            dx = int(w * self.margin)
            dy = int(h * self.margin)

            x1 = max(0, x - dx)
            y1 = max(0, y - dy)
            x2 = min(w_img, x + w + dx)
            y2 = min(h_img, y + h + dy)

            results.append({
                "bbox": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)},
                "expanded_bbox": {"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2)},
                "confidence": 0.95
            })

        return results

    def crop_faces(
        self,
        image_np: np.ndarray,
        target_size: Tuple[int, int] = (224, 224)
    ) -> List[Tuple[np.ndarray, Dict[str, Any]]]:
        """
        Extracts cropped and resized face regions from RGB image.
        """
        detections = self.detect(image_np)
        crops = []

        for idx, det in enumerate(detections):
            box = det["expanded_bbox"]
            crop = image_np[box["y1"]:box["y2"], box["x1"]:box["x2"]]

            if crop.size == 0 or crop.shape[0] < 15 or crop.shape[1] < 15:
                continue

            resized = cv2.resize(crop, target_size, interpolation=cv2.INTER_LINEAR)
            crops.append((resized, det))

        return crops


# Global singleton instance
face_detector = BackendFaceDetector()
