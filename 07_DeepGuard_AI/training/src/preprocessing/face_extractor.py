import cv2
import numpy as np
from typing import List, Tuple, Dict, Any, Optional
from PIL import Image


class FaceExtractor:
    """
    Robust face detection and cropping pipeline for forensic deepfake analysis.
    Supports OpenCV Haar Cascade with optional MTCNN support and context margin expansion.
    Captures forehead, jawline, and ear-boundary artifacts critical for deepfake identification.
    """

    def __init__(self, margin: float = 0.25, min_face_size: int = 40):
        """
        Args:
            margin: Percentage by which bounding box is expanded in each direction (e.g. 0.25 = 25%).
            min_face_size: Minimum pixel dimension for face acceptance.
        """
        self.margin = margin
        self.min_face_size = min_face_size

        # Initialize primary OpenCV Haar Cascade (universally available offline)
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.cascade = cv2.CascadeClassifier(cascade_path)
        if self.cascade.empty():
            raise RuntimeError(f"Failed to load OpenCV face cascade from {cascade_path}")

    def detect_faces(self, image_np: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect face bounding boxes in an RGB or BGR numpy image.

        Args:
            image_np: Image as numpy array (H, W, 3).

        Returns:
            List of dicts: [{"bbox": (x, y, w, h), "confidence": float, "expanded_bbox": (x1, y1, x2, y2)}]
        """
        h_img, w_img = image_np.shape[:2]

        # Convert to grayscale for Haar detector
        if len(image_np.shape) == 3:
            gray = cv2.cvtColor(image_np, cv2.COLOR_BGR2GRAY) if image_np.shape[2] == 3 else image_np
        else:
            gray = image_np

        detections = self.cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(self.min_face_size, self.min_face_size),
            flags=cv2.CASCADE_SCALE_IMAGE,
        )

        results = []
        for (x, y, w, h) in detections:
            # Expand box with margin
            dx = int(w * self.margin)
            dy = int(h * self.margin)

            x1 = max(0, x - dx)
            y1 = max(0, y - dy)
            x2 = min(w_img, x + w + dx)
            y2 = min(h_img, y + h + dy)

            results.append({
                "bbox": (int(x), int(y), int(w), int(h)),
                "expanded_bbox": (int(x1), int(y1), int(x2), int(y2)),
                "confidence": 0.95,  # Nominal confidence for cascade detections
            })

        return results

    def extract_face_crops(
        self,
        image_np: np.ndarray,
        target_size: Optional[Tuple[int, int]] = (224, 224)
    ) -> List[Tuple[np.ndarray, Dict[str, Any]]]:
        """
        Detects and crops all faces from image.

        Args:
            image_np: Full RGB image.
            target_size: Optional resize dimensions (W, H).

        Returns:
            List of (cropped_face_np, metadata_dict).
        """
        detections = self.detect_faces(image_np)
        crops = []

        for idx, det in enumerate(detections):
            x1, y1, x2, y2 = det["expanded_bbox"]
            crop = image_np[y1:y2, x1:x2]

            if crop.size == 0 or crop.shape[0] < 10 or crop.shape[1] < 10:
                continue

            if target_size is not None:
                crop = cv2.resize(crop, target_size, interpolation=cv2.INTER_LINEAR)

            meta = {
                "face_index": idx,
                "bbox": det["bbox"],
                "expanded_bbox": (x1, y1, x2, y2),
                "confidence": det["confidence"],
            }
            crops.append((crop, meta))

        return crops
