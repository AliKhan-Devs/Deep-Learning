import numpy as np
from app.config import settings

class UncertaintyService:
    @staticmethod
    def compute_shannon_entropy(probabilities: np.ndarray) -> float:
        """
        Calculates Shannon Softmax Entropy (base 2):
        H(p) = - sum(p_i * log2(p_i))
        """
        eps = 1e-12
        probs = np.clip(probabilities, eps, 1.0)
        entropy = -np.sum(probs * np.log2(probs))
        return float(entropy)
        
    @classmethod
    def evaluate_clinical_risk(cls, entropy: float, top_confidence: float) -> tuple[str, str]:
        """
        Evaluates risk triage level based on entropy and top confidence.
        """
        if entropy < settings.ENTROPY_CONFIDENT_MAX and top_confidence >= 0.85:
            return (
                "CONFIDENT",
                "High diagnostic certainty. The visual patterns strongly match known pathological markers with minimal distribution dispersion."
            )
        elif entropy < settings.ENTROPY_UNCERTAIN_MIN:
            return (
                "REVIEW_RECOMMENDED",
                "Moderate diagnostic uncertainty. Probability mass is shared between neighboring differential diagnoses; secondary review advised."
            )
        else:
            return (
                "HIGH_UNCERTAINTY",
                "High diagnostic ambiguity. Scan exhibits atypical contrast or overlapping morphological features; mandatory senior neuroradiologist review."
            )

uncertainty_service = UncertaintyService()
