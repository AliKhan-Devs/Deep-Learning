import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
DB_PATH = STORAGE_DIR / "neuroscan_audit.db"

STORAGE_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "NeuroScan XAI"
    VERSION: str = "1.0.0"
    PORT: int = int(os.getenv("NEUROSCAN_PORT", "8002"))
    HOST: str = "0.0.0.0"
    
    # Path Configuration
    BASE_DIR: Path = BASE_DIR
    MODEL_PATH: Path = BASE_DIR / "artifacts" / "models" / "best_densenet121.pth"
    METADATA_PATH: Path = BASE_DIR / "artifacts" / "models" / "model_metadata.json"
    SAMPLES_DIR: Path = BASE_DIR / "assets" / "samples"
    STORAGE_DIR: Path = STORAGE_DIR
    DB_PATH: Path = DB_PATH
    
    # Model Hyperparameters
    IMAGE_SIZE: int = 224
    CLASSES: list[str] = ["glioma", "meningioma", "notumor", "pituitary"]
    NORM_MEAN: list[float] = [0.485, 0.456, 0.406]
    NORM_STD: list[float] = [0.229, 0.224, 0.225]
    
    # Clinical Uncertainty Thresholds (Shannon Softmax Entropy)
    ENTROPY_CONFIDENT_MAX: float = 0.40
    ENTROPY_UNCERTAIN_MIN: float = 0.85
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
        "*"
    ]

settings = Settings()
