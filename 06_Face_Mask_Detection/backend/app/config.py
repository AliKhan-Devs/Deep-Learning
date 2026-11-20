import os
from pathlib import Path
from pydantic import BaseModel

_BASE_DIR = Path(__file__).resolve().parent.parent
_PROJECT_DIR = _BASE_DIR.parent
_RUNS_DIR = _PROJECT_DIR / "notebooks" / "runs"

class Settings(BaseModel):
    PROJECT_NAME: str = "FaceMask AI — Real-time Face Mask Detection"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    PROJECT_DIR: str = str(_PROJECT_DIR)
    RUNS_DIR: str = str(_RUNS_DIR)
    
    # Model Weights Paths
    MODEL_V1_PATH: str = str(_RUNS_DIR / "face_mask_v1" / "weights" / "best.pt")
    MODEL_V2_PATH: str = str(_RUNS_DIR / "face_mask_v2" / "face_mask_v2-2" / "weights" / "best.pt")
    MODEL_V3_PATH: str = str(_RUNS_DIR / "face_mask_v3" / "face_mask_v3" / "weights" / "best.pt")
    
    # Default Champion Model (Experiment 3 - YOLOv26s)
    DEFAULT_MODEL_ID: str = "v3"
    
    # Detection Classes
    CLASS_NAMES: list[str] = ["no_mask", "mask"]
    
    # Default Thresholds
    DEFAULT_CONF_THRESHOLD: float = 0.45
    DEFAULT_IOU_THRESHOLD: float = 0.50
    
    # Host & Port
    HOST: str = "0.0.0.0"
    PORT: int = 8003
    
    # Assets / Temp directories
    TEMP_DIR: str = str(_BASE_DIR / "temp")

settings = Settings()
os.makedirs(settings.TEMP_DIR, exist_ok=True)
