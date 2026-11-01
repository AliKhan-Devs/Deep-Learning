import os
import glob
import pandas as pd
from typing import Tuple, List, Optional


class CelebDFDataset:
    """
    Parser for Celeb-DF (v2) deepfake evaluation benchmark.
    Celebrity deepfake dataset designed with high-quality synthesis,
    serving as an independent zero-shot cross-dataset evaluation source
    to measure real-world model generalization.
    """

    def __init__(self, dataset_root: str):
        self.dataset_root = dataset_root

    def build_test_manifest(self) -> pd.DataFrame:
        """
        Parses Celeb-DF v2 directory or official test split list.
        """
        records = []
        test_list_path = os.path.join(self.dataset_root, "List_of_testing_videos.txt")

        if os.path.exists(test_list_path):
            with open(test_list_path, "r", encoding="utf-8") as f:
                for line in f:
                    parts = line.strip().split()
                    if len(parts) >= 2:
                        # 1: real, 0: fake in original Celeb-DF test list
                        celeb_label = int(parts[0])
                        rel_path = parts[1]
                        # Standardize to 0: REAL, 1: FAKE
                        our_label = 0 if celeb_label == 1 else 1
                        full_path = os.path.join(self.dataset_root, rel_path)
                        records.append({
                            "video_path": full_path,
                            "label": our_label,
                            "class_name": "REAL" if our_label == 0 else "FAKE",
                            "dataset": "Celeb-DF-v2",
                        })
        else:
            # Fallback to directory scan
            for real_path in glob.glob(os.path.join(self.dataset_root, "Celeb-real", "*.mp4")):
                records.append({
                    "video_path": real_path,
                    "label": 0,
                    "class_name": "REAL",
                    "dataset": "Celeb-DF-v2",
                })
            for fake_path in glob.glob(os.path.join(self.dataset_root, "Celeb-synthesis", "*.mp4")):
                records.append({
                    "video_path": fake_path,
                    "label": 1,
                    "class_name": "FAKE",
                    "dataset": "Celeb-DF-v2",
                })

        return pd.DataFrame(records)
