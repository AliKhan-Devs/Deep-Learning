from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class ProbabilityItem(BaseModel):
    class_name: str
    probability: float
    percentage: float

class BoundingBox(BaseModel):
    x: int
    y: int
    w: int
    h: int
    confidence_score: float

class DiagnosticResult(BaseModel):
    scan_id: str
    predicted_class: str
    confidence: float
    entropy: float
    risk_level: str
    risk_description: str
    has_tumor: bool
    probabilities: List[ProbabilityItem]
    
    # Base64 encoded JPEG/PNG images
    original_b64: str
    gradcam_jet_b64: str
    gradcam_pp_jet_b64: str
    gradcam_turbo_b64: str
    gradcam_viridis_b64: str
    contours_overlay_b64: str
    
    bounding_boxes: List[BoundingBox] = Field(default_factory=list)
    inference_time_ms: float

class SampleScanInfo(BaseModel):
    id: str
    class_name: str
    filename: str
    title: str
    clinical_notes: str
    image_url: str

class AuditLogItem(BaseModel):
    id: int
    scan_id: str
    patient_id: Optional[str] = None
    predicted_class: str
    confidence: float
    entropy: float
    risk_level: str
    probabilities: Dict[str, float]
    notes: Optional[str] = None
    created_at: str

class AuditLogCreate(BaseModel):
    scan_id: str
    patient_id: Optional[str] = None
    notes: Optional[str] = None

class SystemStatusResponse(BaseModel):
    project: str
    version: str
    architecture: str
    device: str
    num_classes: int
    classes: List[str]
    best_validation_accuracy: float
    test_accuracy_pct: str
    status: str
