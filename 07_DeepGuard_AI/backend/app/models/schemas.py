from typing import List, Optional, Dict, Any, Tuple
from pydantic import BaseModel, Field
from datetime import datetime


class BoundingBox(BaseModel):
    x: int
    y: int
    w: int
    h: int


class ExpandedBoundingBox(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int


class FacePrediction(BaseModel):
    face_index: int
    bbox: BoundingBox
    expanded_bbox: ExpandedBoundingBox
    fake_probability: float
    real_probability: float
    predicted_label: str  # "REAL" or "FAKE"
    confidence: float
    model_score: float


class ImageAnalysisResponse(BaseModel):
    analysis_id: str
    created_at: str
    media_type: str = "image"
    original_filename: str
    model_name: str
    status: str  # "COMPLETED", "FAILED"
    prediction: str  # "Likely Manipulated", "Likely Authentic", "Inconclusive"
    fake_probability: float
    real_probability: float
    faces_detected_count: int
    faces: List[FacePrediction] = []
    execution_duration_sec: float
    disclaimer: str = (
        "This result is an AI-generated forensic assessment and is not definitive "
        "proof of media authenticity or manipulation."
    )


class VideoFrameDetail(BaseModel):
    frame_index: int
    timestamp_sec: float
    thumbnail_url: Optional[str] = None
    faces_count: int
    fake_probability: float
    real_probability: float
    is_suspicious: bool
    face_boxes: List[Dict[str, Any]] = []


class VideoAnalysisResponse(BaseModel):
    analysis_id: str
    created_at: str
    media_type: str = "video"
    original_filename: str
    model_name: str
    status: str  # "PENDING", "PROCESSING", "COMPLETED", "FAILED"
    progress_pct: int = 0
    prediction: Optional[str] = None
    fake_probability: Optional[float] = None
    real_probability: Optional[float] = None
    frames_analyzed: int = 0
    frames_with_faces: int = 0
    suspicious_frames_count: int = 0
    execution_duration_sec: float = 0.0
    timeline: List[VideoFrameDetail] = []
    error_message: Optional[str] = None
    disclaimer: str = (
        "This result is an AI-generated forensic assessment and is not definitive "
        "proof of media authenticity or manipulation."
    )


class ModelInfo(BaseModel):
    model_name: str
    display_name: str
    architecture: str
    num_classes: int
    classes: List[str]
    input_size: List[int]
    decision_threshold: float
    checkpoint_exists: bool
    checkpoint_path: str
    device: str
    is_ready: bool
    colab_instructions: str


class SystemStatus(BaseModel):
    status: str
    version: str
    device: str
    cuda_available: bool
    cuda_device_name: Optional[str] = None
    total_analyses: int
    models_ready: List[str]
    models_missing: List[str]
    storage_uploads_count: int


class AnalysisSummaryItem(BaseModel):
    id: str
    created_at: str
    media_type: str
    original_filename: str
    model_name: str
    status: str
    prediction: Optional[str] = None
    fake_probability: Optional[float] = None
    real_probability: Optional[float] = None
    execution_duration_sec: float = 0.0


class HistoryResponse(BaseModel):
    items: List[AnalysisSummaryItem]
    total_count: int
    total_images: int
    total_videos: int
    manipulated_count: int
    authentic_count: int
