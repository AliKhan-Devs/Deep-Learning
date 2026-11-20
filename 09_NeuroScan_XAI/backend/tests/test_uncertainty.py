import numpy as np
from app.services.uncertainty_service import uncertainty_service

def test_entropy_one_hot_is_zero():
    # Certain prediction: [1.0, 0.0, 0.0, 0.0] -> Entropy should be 0.0
    probs = np.array([1.0, 0.0, 0.0, 0.0])
    h = uncertainty_service.compute_shannon_entropy(probs)
    assert abs(h) < 1e-4

def test_entropy_uniform_is_maximum():
    # Maximum uncertainty across 4 classes: [0.25, 0.25, 0.25, 0.25] -> Entropy should be log2(4) = 2.0
    probs = np.array([0.25, 0.25, 0.25, 0.25])
    h = uncertainty_service.compute_shannon_entropy(probs)
    assert abs(h - 2.0) < 1e-4

def test_clinical_risk_triage_confident():
    risk_level, _ = uncertainty_service.evaluate_clinical_risk(entropy=0.25, top_confidence=0.95)
    assert risk_level == "CONFIDENT"

def test_clinical_risk_triage_review_recommended():
    risk_level, _ = uncertainty_service.evaluate_clinical_risk(entropy=0.65, top_confidence=0.75)
    assert risk_level == "REVIEW_RECOMMENDED"

def test_clinical_risk_triage_high_uncertainty():
    risk_level, _ = uncertainty_service.evaluate_clinical_risk(entropy=1.50, top_confidence=0.40)
    assert risk_level == "HIGH_UNCERTAINTY"
