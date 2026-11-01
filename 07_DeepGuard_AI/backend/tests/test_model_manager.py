import pytest
from app.services.model_manager import model_manager
from app.core.exceptions import CheckpointMissingError, ModelNotFoundError


def test_model_configs_loaded():
    """Verifies model configs exist for efficientnet_b0 and xception."""
    configs = model_manager.list_models_status()
    names = [c["model_name"] for c in configs]
    assert "efficientnet_b0" in names
    assert "xception" in names


def test_missing_checkpoint_raises_error():
    """Verifies that attempting inference without weights raises CheckpointMissingError with instructions."""
    # Unless user has downloaded best_model.pth, is_checkpoint_available is False
    if not model_manager.is_checkpoint_available("efficientnet_b0"):
        with pytest.raises(CheckpointMissingError) as exc_info:
            model_manager.get_model("efficientnet_b0")
        assert "Trained checkpoint weights" in str(exc_info.value)
        assert "Colab" in str(exc_info.value)


def test_unsupported_model_raises_error():
    """Verifies requesting an unknown model raises ModelNotFoundError."""
    with pytest.raises(ModelNotFoundError):
        model_manager.get_model("unsupported_resnet999")
