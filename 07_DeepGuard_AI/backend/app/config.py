import os
from pathlib import Path
from typing import List, Set


class Settings:
    """Central configuration for DeepGuard AI Backend."""

    PROJECT_NAME: str = "DeepGuard AI"
    PROJECT_DESCRIPTION: str = "Deepfake Image & Video Detection System Using Deep Learning"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Base Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    STORAGE_DIR: Path = BASE_DIR / "storage"
    UPLOAD_DIR: Path = STORAGE_DIR / "uploads"
    REPORTS_DIR: Path = STORAGE_DIR / "reports"
    THUMBNAILS_DIR: Path = STORAGE_DIR / "thumbnails"
    MODELS_DIR: Path = BASE_DIR / "artifacts" / "models"
    DB_PATH: Path = STORAGE_DIR / "deepguard.db"

    # Upload constraints
    MAX_IMAGE_SIZE_BYTES: int = 15 * 1024 * 1024       # 15 MB
    MAX_VIDEO_SIZE_BYTES: int = 150 * 1024 * 1024     # 150 MB
    ALLOWED_IMAGE_EXTENSIONS: Set[str] = {".jpg", ".jpeg", ".png"}
    ALLOWED_VIDEO_EXTENSIONS: Set[str] = {".mp4", ".mov", ".avi", ".mkv"}

    # Video Sampling Hyperparameters
    VIDEO_SAMPLE_INTERVAL_SEC: float = 0.75  # Sample one frame every 0.75s
    VIDEO_MAX_FRAMES: int = 40              # Cap frames per video to prevent memory exhaustion
    FACE_CROP_MARGIN: float = 0.25           # 25% boundary expansion for context

    # Decision Thresholds & Aggregation Strategy
    DEFAULT_MODEL: str = "efficientnet_b0"
    DEFAULT_DECISION_THRESHOLD: float = 0.50
    AGGREGATION_METHOD: str = "trimmed_mean" # "trimmed_mean", "mean", or "suspicious_ratio"
    SUSPICIOUS_FRAME_THRESHOLD: float = 0.65 # Frame considered suspicious if P(FAKE) >= 0.65
    SUSPICIOUS_RATIO_TRIGGER: float = 0.25   # Video flagged if >= 25% valid frames are suspicious

    # Supported model architectures
    SUPPORTED_MODELS: List[str] = ["efficientnet_b0", "xception"]

    def ensure_directories(self) -> None:
        """Create necessary storage directories if they do not exist."""
        for path in [self.UPLOAD_DIR, self.REPORTS_DIR, self.THUMBNAILS_DIR, self.MODELS_DIR]:
            path.mkdir(parents=True, exist_ok=True)


settings = Settings()
settings.ensure_directories()
