import cv2
import numpy as np
from typing import Dict, Any
from ..config import settings
from ..core.logging import logger


class LivenessDetector:
    """
    Passive Liveness & Anti-Spoofing Filter.
    Evaluates:
    1. High-frequency Laplacian texture variance (detects screen blur & flat paper)
    2. Chrominance distribution across YCrCb space (detects unnatural screen color casts)
    """

    def __init__(self, laplacian_thresh: float = settings.LIVENESS_LAPLACIAN_THRESHOLD):
        self.laplacian_thresh = laplacian_thresh

    def check_liveness(self, face_rgb: np.ndarray) -> Dict[str, Any]:
        if not settings.LIVENESS_ENABLED:
            return {"is_live": True, "score": 99.0, "reason": "LIVENESS_DISABLED"}

        if face_rgb is None or face_rgb.size == 0:
            return {"is_live": False, "score": 0.0, "reason": "EMPTY_FACE"}

        gray = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2GRAY)
        
        # 1. Laplacian Variance
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        variance = float(laplacian.var())

        # 2. Chrominance analysis in YCrCb
        ycrcb = cv2.cvtColor(face_rgb, cv2.COLOR_RGB2YCrCb)
        cr = ycrcb[:, :, 1]
        cb = ycrcb[:, :, 2]
        cr_std = float(cr.std())
        cb_std = float(cb.std())

        # Live human skin has rich chrominance standard deviations (usually > 6.0)
        # LCD screens often compress or clamp chrominance distribution
        is_texture_valid = variance >= self.laplacian_thresh
        is_chroma_valid = (cr_std + cb_std) >= 8.0

        is_live = is_texture_valid and is_chroma_valid
        composite_score = min(100.0, (variance / max(1.0, self.laplacian_thresh)) * 50.0 + (cr_std + cb_std) * 2.5)

        return {
            "is_live": is_live,
            "score": round(composite_score, 1),
            "laplacian_var": round(variance, 2),
            "chroma_spread": round(cr_std + cb_std, 2),
            "reason": "VERIFIED_LIVE" if is_live else "POTENTIAL_SPOOF_TEXTURE"
        }


# Global singleton
liveness_detector = LivenessDetector()
