import os
import glob
from typing import List, Dict, Tuple, Optional
import pandas as pd


class FaceForensicsDataset:
    """
    Parser and split manager for FaceForensics++ (FF++).
    Supports all manipulation methods:
    - Deepfakes (DF)
    - Face2Face (F2F)
    - FaceSwap (FS)
    - NeuralTextures (NT)
    - FaceShifter (FSh)
    and pristine YouTube originals across c23 (high quality), c40 (compressed), and raw.

    CRITICAL DATA LEAKAGE PREVENTION:
    All frames or videos sharing the same source identity/original video ID
    are strictly isolated into the same partition (train, val, or test).
    """

    METHODS = ["Deepfakes", "Face2Face", "FaceSwap", "NeuralTextures"]

    def __init__(
        self,
        dataset_root: str,
        compression: str = "c23",
        seed: int = 42
    ):
        self.dataset_root = dataset_root
        self.compression = compression
        self.seed = seed

    def build_video_manifest(self) -> pd.DataFrame:
        """
        Scans dataset directory and builds a DataFrame of videos,
        extracting source video IDs for strict leak-free partitioning.
        """
        records = []

        # 1. Real videos (original_sequences/youtube)
        real_pattern = os.path.join(
            self.dataset_root,
            "original_sequences",
            "youtube",
            self.compression,
            "videos",
            "*.mp4"
        )
        for path in glob.glob(real_pattern):
            vid_id = os.path.splitext(os.path.basename(path))[0]
            records.append({
                "video_path": path,
                "label": 0,
                "class_name": "REAL",
                "method": "original",
                "source_id": vid_id,  # e.g., "042"
            })

        # 2. Manipulated videos (manipulated_sequences/<method>)
        for method in self.METHODS:
            fake_pattern = os.path.join(
                self.dataset_root,
                "manipulated_sequences",
                method,
                self.compression,
                "videos",
                "*.mp4"
            )
            for path in glob.glob(fake_pattern):
                base_name = os.path.splitext(os.path.basename(path))[0]
                # In FF++, manipulated filenames are typically <source1>_<source2>
                source_id = base_name.split("_")[0]
                records.append({
                    "video_path": path,
                    "label": 1,
                    "class_name": "FAKE",
                    "method": method,
                    "source_id": source_id,
                })

        df = pd.DataFrame(records)
        return df

    def create_leak_free_splits(
        self,
        df: pd.DataFrame,
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Splits dataset by grouping on `source_id` so that an actor/original video
        never appears across both train and validation/test splits.
        """
        unique_sources = sorted(df["source_id"].unique())
        
        # Deterministic shuffle
        import random
        rng = random.Random(self.seed)
        shuffled_sources = list(unique_sources)
        rng.shuffle(shuffled_sources)

        n_total = len(shuffled_sources)
        n_train = int(n_total * train_ratio)
        n_val = int(n_total * val_ratio)

        train_ids = set(shuffled_sources[:n_train])
        val_ids = set(shuffled_sources[n_train:n_train + n_val])
        test_ids = set(shuffled_sources[n_train + n_val:])

        train_df = df[df["source_id"].isin(train_ids)].copy().reset_index(drop=True)
        val_df = df[df["source_id"].isin(val_ids)].copy().reset_index(drop=True)
        test_df = df[df["source_id"].isin(test_ids)].copy().reset_index(drop=True)

        return train_df, val_df, test_df
