from typing import List, Dict, Any, Tuple
import numpy as np

from ..config import settings
from ..core.logging import logger


class VideoScoreAggregator:
    """
    Forensic video prediction aggregator.
    Synthesizes frame-level predictions into a robust video-level forensic assessment.
    
    Prevents simplistic max-pooling vulnerabilities (where one noisy compression glitch
    triggers a false positive) and naive mean vulnerabilities (where a brief deepfake scene
    in a long authentic video gets diluted).
    """

    def __init__(
        self,
        decision_threshold: float = settings.DEFAULT_DECISION_THRESHOLD,
        suspicious_threshold: float = settings.SUSPICIOUS_FRAME_THRESHOLD,
        suspicious_ratio_trigger: float = settings.SUSPICIOUS_RATIO_TRIGGER,
        method: str = settings.AGGREGATION_METHOD
    ):
        self.decision_threshold = decision_threshold
        self.suspicious_threshold = suspicious_threshold
        self.suspicious_ratio_trigger = suspicious_ratio_trigger
        self.method = method

    def aggregate(self, frame_predictions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregates a sequence of frame predictions.

        Args:
            frame_predictions: List of dicts with keys:
                - 'frame_index': int
                - 'timestamp_sec': float
                - 'faces_count': int
                - 'fake_probability': float
                - 'real_probability': float

        Returns:
            Dictionary with aggregated scores and forensic verdict.
        """
        valid_frames = [f for f in frame_predictions if f.get("faces_count", 0) > 0]

        if not valid_frames:
            return {
                "prediction": "Inconclusive / insufficient analyzable content",
                "fake_probability": 0.0,
                "real_probability": 0.0,
                "frames_analyzed": len(frame_predictions),
                "frames_with_faces": 0,
                "suspicious_frames_count": 0,
                "suspicious_frame_ratio": 0.0,
                "aggregation_method": self.method,
                "note": "No detectable faces were present in the sampled frames."
            }

        fake_scores = [f["fake_probability"] for f in valid_frames]

        # Calculate standard mean
        mean_score = float(np.mean(fake_scores))

        # Calculate trimmed mean (discard top 10% and bottom 10% if >= 10 frames)
        if len(fake_scores) >= 10:
            sorted_scores = sorted(fake_scores)
            trim_count = max(1, int(len(sorted_scores) * 0.10))
            trimmed_slice = sorted_scores[trim_count:-trim_count]
            trimmed_score = float(np.mean(trimmed_slice))
        else:
            trimmed_score = mean_score

        # Identify suspicious frames
        suspicious_frames = [s for s in fake_scores if s >= self.suspicious_threshold]
        suspicious_count = len(suspicious_frames)
        suspicious_ratio = suspicious_count / max(1, len(fake_scores))

        # Primary aggregated score based on configured method
        if self.method == "trimmed_mean":
            aggregated_fake_prob = trimmed_score
        else:
            aggregated_fake_prob = mean_score

        aggregated_real_prob = float(max(0.0, min(1.0, 1.0 - aggregated_fake_prob)))

        # Forensic Decision Logic
        # Triggered if overall score exceeds threshold OR sustained suspicious burst occurs
        if (aggregated_fake_prob >= self.decision_threshold) or (suspicious_ratio >= self.suspicious_ratio_trigger):
            verdict = "Likely Manipulated"
        else:
            verdict = "Likely Authentic"

        return {
            "prediction": verdict,
            "fake_probability": round(aggregated_fake_prob, 4),
            "real_probability": round(aggregated_real_prob, 4),
            "frames_analyzed": len(frame_predictions),
            "frames_with_faces": len(valid_frames),
            "suspicious_frames_count": suspicious_count,
            "suspicious_frame_ratio": round(suspicious_ratio, 4),
            "aggregation_method": self.method,
            "mean_score": round(mean_score, 4),
            "trimmed_mean_score": round(trimmed_score, 4),
        }


# Global singleton instance
score_aggregator = VideoScoreAggregator()
