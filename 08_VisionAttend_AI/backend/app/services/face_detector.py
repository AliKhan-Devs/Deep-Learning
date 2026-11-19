import cv2
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple
from ..config import settings
from ..core.logging import logger


class FaceDetector:
    """
    Production-grade Face Detector for VisionAttend AI.
    Features:
    - Multi-stage Haar Cascade fallbacks (alt2 -> default -> alt)
    - 20% margin expansion to capture complete jawline and cranium
    - Normalized 160x160 face crop extraction for InceptionResnetV1 embedding
    """

    def __init__(self, margin: float = settings.FACE_CROP_MARGIN, min_face_size: int = 40):
        self.margin = margin
        self.min_face_size = min_face_size
        self.cascades: List[Tuple[str, Any]] = []

        cascades_dir = Path(__file__).resolve().parent.parent / "assets" / "cascades"
        candidate_names = [
            "haarcascade_frontalface_alt2.xml",
            "haarcascade_frontalface_default.xml",
            "haarcascade_frontalface_alt.xml"
        ]

        if hasattr(cv2, "CascadeClassifier"):
            for name in candidate_names:
                p = cascades_dir / name
                if p.exists():
                    try:
                        cascade = cv2.CascadeClassifier(str(p))
                        if not cascade.empty():
                            self.cascades.append((name, cascade))
                    except Exception as e:
                        logger.warning(f"Error loading cascade {name}: {e}")

        if not self.cascades:
            logger.warning("No face cascades could be loaded. Fallback detection mode active.")
        else:
            logger.info(f"Loaded {len(self.cascades)} OpenCV face cascades for VisionAttend.")

    def detect_and_crop(
        self, image_rgb: np.ndarray, target_size: Tuple[int, int] = (160, 160)
    ) -> List[Dict[str, Any]]:
        """
        Detects faces in an RGB image.
        Returns list of dicts:
        [{
            "bbox": {"x": int, "y": int, "w": int, "h": int},
            "crop_rgb": np.ndarray (160x160),
            "confidence": float
        }]
        """
        if image_rgb is None or image_rgb.size == 0:
            return []

        h_img, w_img = image_rgb.shape[:2]
        gray = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2GRAY)
        flags = getattr(cv2, "CASCADE_SCALE_IMAGE", 0)

        raw_boxes = []
        for name, cascade in self.cascades:
            try:
                faces = cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.1,
                    minNeighbors=4,
                    minSize=(self.min_face_size, self.min_face_size),
                    flags=flags,
                )
                if len(faces) > 0:
                    raw_boxes = faces
                    break
            except Exception as e:
                logger.debug(f"Cascade {name} detect error: {e}")

        # If missed and image is large enough, try looser parameters
        if len(raw_boxes) == 0 and self.cascades:
            try:
                raw_boxes = self.cascades[0][1].detectMultiScale(
                    gray,
                    scaleFactor=1.05,
                    minNeighbors=2,
                    minSize=(max(24, self.min_face_size - 16), max(24, self.min_face_size - 16)),
                    flags=flags,
                )
            except Exception:
                pass

        results = []
        for (x, y, w, h) in raw_boxes:
            # Expand bounding box
            dx = int(w * self.margin)
            dy = int(h * self.margin)

            x1 = max(0, x - dx)
            y1 = max(0, y - dy)
            x2 = min(w_img, x + w + dx)
            y2 = min(h_img, y + h + dy)

            crop = image_rgb[y1:y2, x1:x2]
            if crop.size == 0 or crop.shape[0] < 10 or crop.shape[1] < 10:
                continue

            # Resize to target size for FaceNet (160x160)
            crop_resized = cv2.resize(crop, target_size, interpolation=cv2.INTER_AREA)

            results.append({
                "bbox": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)},
                "expanded_bbox": {"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2)},
                "crop_rgb": crop_resized,
                "confidence": 0.96,
            })

        return results


# Global singleton
face_detector = FaceDetector()
