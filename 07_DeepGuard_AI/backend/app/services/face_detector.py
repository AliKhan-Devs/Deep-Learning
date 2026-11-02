import os
import cv2
import numpy as np
from pathlib import Path
from typing import List, Tuple, Dict, Any, Optional
from PIL import Image

from ..config import settings
from ..core.logging import logger
from ..core.exceptions import FaceDetectionError


class BackendFaceDetector:
    """
    Robust face detection service.
    Employs OpenCV Haar Cascades with multi-stage cascade fallbacks:
    1. Primary: haarcascade_frontalface_alt2 (highest accuracy)
    2. Secondary: haarcascade_frontalface_default
    3. Fallback: Full-image candidate when direct face crops are uploaded.

    Applies 25% bounding box margin expansion to capture hair/jawline artifacts.
    """

    def __init__(self, margin: float = settings.FACE_CROP_MARGIN, min_face_size: int = 30):
        self.margin = margin
        self.min_face_size = min_face_size
        self.cascades: List[Tuple[str, Any]] = []

        # Candidate paths for cascade XMLs
        project_cascades_dir = Path(__file__).resolve().parent.parent / "assets" / "cascades"
        cv2_cascades_dir = Path(getattr(cv2.data, "haarcascades", "")) if hasattr(cv2, "data") else None

        cascade_names = [
            "haarcascade_frontalface_alt2.xml",
            "haarcascade_frontalface_default.xml",
            "haarcascade_frontalface_alt.xml"
        ]

        if hasattr(cv2, "CascadeClassifier"):
            for c_name in cascade_names:
                candidate_paths = [
                    project_cascades_dir / c_name,
                    cv2_cascades_dir / c_name if cv2_cascades_dir else None
                ]
                for p in candidate_paths:
                    if p and p.exists():
                        try:
                            cascade = cv2.CascadeClassifier(str(p))
                            if not cascade.empty():
                                self.cascades.append((c_name, cascade))
                                logger.info(f"Loaded face cascade: {p}")
                                break
                        except Exception as e:
                            logger.warning(f"Error loading cascade from {p}: {e}")

        if not self.cascades:
            logger.warning("No OpenCV Haar Cascades loaded. Direct face-crop fallback mode will be used.")

    def detect(self, image_np: np.ndarray, allow_full_frame_fallback: bool = True) -> List[Dict[str, Any]]:
        """
        Detects faces in an RGB image.
        Returns list of bounding boxes and expanded bounding boxes.
        If no faces are detected and allow_full_frame_fallback is True,
        treats the whole image as a single face crop (essential for cropped avatar/dataset uploads).
        """
        if image_np is None or image_np.size == 0:
            return []

        h_img, w_img = image_np.shape[:2]
        gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
        flags = getattr(cv2, "CASCADE_SCALE_IMAGE", 0)

        raw_faces = []
        for name, cascade in self.cascades:
            try:
                detected = cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.08,
                    minNeighbors=4,
                    minSize=(self.min_face_size, self.min_face_size),
                    flags=flags
                )
                if len(detected) > 0:
                    raw_faces = detected
                    break
            except Exception as e:
                logger.debug(f"Cascade {name} detection error: {e}")

        # If strict cascade missed, try lower neighbor threshold with default cascade
        if len(raw_faces) == 0 and self.cascades:
            try:
                raw_faces = self.cascades[0][1].detectMultiScale(
                    gray,
                    scaleFactor=1.05,
                    minNeighbors=2,
                    minSize=(max(20, self.min_face_size - 10), max(20, self.min_face_size - 10)),
                    flags=flags
                )
            except Exception:
                pass

        results = []
        for (x, y, w, h) in raw_faces:
            dx = int(w * self.margin)
            dy = int(h * self.margin)

            x1 = max(0, x - dx)
            y1 = max(0, y - dy)
            x2 = min(w_img, x + w + dx)
            y2 = min(h_img, y + h + dy)

            results.append({
                "bbox": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)},
                "expanded_bbox": {"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2)},
                "confidence": 0.95,
                "is_fallback": False
            })

        # Smart Fallback: When uploading direct face crops (e.g. 256x256 headshots or dataset crops)
        if len(results) == 0 and allow_full_frame_fallback and w_img >= 48 and h_img >= 48:
            logger.info("No cascade face found; applying full-frame candidate crop.")
            # Assume image is a close-up face crop
            results.append({
                "bbox": {"x": 0, "y": 0, "w": int(w_img), "h": int(h_img)},
                "expanded_bbox": {"x1": 0, "y1": 0, "x2": int(w_img), "y2": int(h_img)},
                "confidence": 0.80,
                "is_fallback": True
            })

        return results

    def crop_faces(
        self,
        image_np: np.ndarray,
        target_size: Tuple[int, int] = (224, 224),
        allow_full_frame_fallback: bool = True
    ) -> List[Tuple[np.ndarray, Dict[str, Any]]]:
        """
        Extracts cropped and resized face regions from RGB image.
        """
        detections = self.detect(image_np, allow_full_frame_fallback=allow_full_frame_fallback)
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
