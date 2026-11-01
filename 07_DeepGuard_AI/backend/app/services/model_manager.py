import os
import json
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import torch
import torch.nn as nn

from ..config import settings
from ..core.logging import logger
from ..core.exceptions import ModelNotFoundError, CheckpointMissingError


class ModelManager:
    """
    Central model registry and lifecycle manager.
    - Inspects local checkpoint existence.
    - Validates configuration schemas.
    - Handles safe weights loading.
    - Automatically detects and allocates to CUDA when available.
    - Provides graceful handling when weights are not yet downloaded from Colab.
    """

    def __init__(self):
        self._loaded_models: Dict[str, nn.Module] = {}
        self._model_configs: Dict[str, Dict[str, Any]] = {}
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"ModelManager initialized on device: {self.device}")
        self._load_all_configs()

    def _load_all_configs(self) -> None:
        """Discovers and parses model_config.json files from the artifacts directory."""
        for model_dir in settings.MODELS_DIR.iterdir():
            if model_dir.is_dir():
                cfg_file = model_dir / "model_config.json"
                if cfg_file.exists():
                    try:
                        with open(cfg_file, "r", encoding="utf-8") as f:
                            cfg = json.load(f)
                            model_id = cfg.get("model_name", model_dir.name)
                            self._model_configs[model_id] = cfg
                    except Exception as e:
                        logger.error(f"Failed to parse config at {cfg_file}: {e}")

    def get_config(self, model_name: str) -> Dict[str, Any]:
        """Returns the parsed configuration for a model."""
        if model_name not in self._model_configs:
            self._load_all_configs()
        if model_name not in self._model_configs:
            raise ModelNotFoundError(model_name)
        return self._model_configs[model_name]

    def get_checkpoint_path(self, model_name: str) -> Path:
        """Determines the expected path to the .pth weights file."""
        return settings.MODELS_DIR / model_name / "best_model.pth"

    def is_checkpoint_available(self, model_name: str) -> bool:
        """Checks if the trained checkpoint weights exist on disk."""
        chk_path = self.get_checkpoint_path(model_name)
        return chk_path.exists() and chk_path.stat().st_size > 1000

    def get_model(self, model_name: str) -> Tuple[nn.Module, Dict[str, Any]]:
        """
        Retrieves or instantiates and loads the specified model.
        
        Raises:
            ModelNotFoundError: If architecture is not supported.
            CheckpointMissingError: If best_model.pth is missing.
        """
        config = self.get_config(model_name)
        chk_path = self.get_checkpoint_path(model_name)

        if not self.is_checkpoint_available(model_name):
            raise CheckpointMissingError(model_name, str(chk_path))

        if model_name in self._loaded_models:
            return self._loaded_models[model_name], config

        # Instantiate architecture
        logger.info(f"Loading weights for '{model_name}' from {chk_path} onto {self.device}...")
        arch = config.get("architecture", model_name)
        num_classes = config.get("num_classes", 2)

        # Import training model factory
        import sys
        training_src = str(settings.BASE_DIR.parent / "training" / "src")
        if training_src not in sys.path:
            sys.path.insert(0, training_src)

        from models.factory import create_model, load_detector_checkpoint

        model = create_model(arch, num_classes=num_classes, pretrained=False)
        model, _ = load_detector_checkpoint(model, str(chk_path), self.device)
        model.eval()

        self._loaded_models[model_name] = model
        logger.info(f"Model '{model_name}' successfully loaded and cached.")
        return model, config

    def list_models_status(self) -> list:
        """Returns status list for all configured models."""
        self._load_all_configs()
        results = []
        for name, cfg in self._model_configs.items():
            chk_path = self.get_checkpoint_path(name)
            is_avail = self.is_checkpoint_available(name)
            results.append({
                "model_name": name,
                "display_name": cfg.get("display_name", name),
                "architecture": cfg.get("architecture", name),
                "num_classes": cfg.get("num_classes", 2),
                "classes": cfg.get("classes", ["REAL", "FAKE"]),
                "input_size": cfg.get("input_size", [224, 224]),
                "decision_threshold": cfg.get("decision_threshold", 0.50),
                "checkpoint_exists": is_avail,
                "checkpoint_path": str(chk_path),
                "device": str(self.device),
                "is_ready": is_avail,
                "colab_instructions": (
                    f"To enable this model, execute Colab notebook "
                    f"({'03_efficientnet_training.ipynb' if 'eff' in name else '04_xception_training.ipynb'}), "
                    f"download best_model.pth, and save to {chk_path}"
                )
            })
        return results


# Global singleton instance
model_manager = ModelManager()
