import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "app" / "storage"
AVATAR_DIR = STORAGE_DIR / "avatars"
SNAPSHOT_DIR = STORAGE_DIR / "snapshots"
DB_PATH = STORAGE_DIR / "visionattend.db"

# Ensure storage directories exist
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
AVATAR_DIR.mkdir(parents=True, exist_ok=True)
SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)


class Settings(BaseModel):
    PROJECT_NAME: str = "VisionAttend AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Storage Paths
    BASE_DIR: Path = BASE_DIR
    STORAGE_DIR: Path = STORAGE_DIR
    AVATAR_DIR: Path = AVATAR_DIR
    SNAPSHOT_DIR: Path = SNAPSHOT_DIR
    DB_PATH: Path = DB_PATH
    
    # Biometric Recognition Parameters
    COSINE_THRESHOLD: float = 0.65  # Sim >= 0.65 indicates verified match
    FACE_CROP_MARGIN: float = 0.20
    INPUT_SIZE: tuple = (160, 160)
    
    # Anti-Spoofing & Liveness
    LIVENESS_ENABLED: bool = True
    LIVENESS_LAPLACIAN_THRESHOLD: float = 40.0
    
    # Attendance Policy
    WORK_START_TIME: str = "09:00:00"  # HH:MM:SS
    LATE_GRACE_MINUTES: int = 15      # After 09:15:00 -> LATE
    DEBOUNCE_COOLDOWN_SECONDS: int = 60 # Cooldown per employee check-in attempt


settings = Settings()
