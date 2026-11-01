import pytest
from app.config import settings


def test_settings_initialization():
    """Verifies settings paths and constraints are configured properly."""
    assert settings.PROJECT_NAME == "DeepGuard AI"
    assert settings.VERSION == "1.0.0"
    assert settings.DEFAULT_DECISION_THRESHOLD == 0.50
    assert ".jpg" in settings.ALLOWED_IMAGE_EXTENSIONS
    assert ".mp4" in settings.ALLOWED_VIDEO_EXTENSIONS
    assert settings.VIDEO_MAX_FRAMES > 0
    assert settings.FACE_CROP_MARGIN == 0.25


def test_directories_exist():
    """Ensures storage directories are present."""
    assert settings.UPLOAD_DIR.exists()
    assert settings.REPORTS_DIR.exists()
    assert settings.THUMBNAILS_DIR.exists()
    assert settings.MODELS_DIR.exists()
