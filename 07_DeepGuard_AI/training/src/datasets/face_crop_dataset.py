import os
from typing import List, Tuple, Optional, Callable
import torch
from torch.utils.data import Dataset
from PIL import Image
import pandas as pd


class FaceCropDataset(Dataset):
    """
    PyTorch Dataset for pre-extracted facial crops.
    Reads manifest CSV with columns ['image_path', 'label'] or list of tuples.
    """

    def __init__(
        self,
        manifest: pd.DataFrame,
        transform: Optional[Callable] = None
    ):
        """
        Args:
            manifest: DataFrame containing 'image_path' and 'label' (0: REAL, 1: FAKE).
            transform: Torchvision transformation pipeline.
        """
        self.manifest = manifest.reset_index(drop=True)
        self.transform = transform

    def __len__(self) -> int:
        return len(self.manifest)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, int]:
        row = self.manifest.iloc[idx]
        img_path = row["image_path"]
        label = int(row["label"])

        if not os.path.exists(img_path):
            raise FileNotFoundError(f"Face crop missing: {img_path}")

        image = Image.open(img_path).convert("RGB")

        if self.transform is not None:
            image = self.transform(image)

        return image, label
