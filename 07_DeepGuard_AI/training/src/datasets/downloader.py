"""
DeepGuard AI - Automated Dataset Downloader
Supports direct URL and cloud downloads for zero-manual-upload Google Colab training.
"""

import os
import sys
import glob
import json
import shutil
import urllib.request
import zipfile
from pathlib import Path
from typing import Optional, Dict, List, Tuple
import pandas as pd


def download_file_with_progress(url: str, output_path: str) -> str:
    """Download a file with progress reporting."""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    
    print(f"[Downloader] Downloading {url} -> {output_path}")
    
    def _reporthook(block_num, block_size, total_size):
        if total_size > 0:
            downloaded = block_num * block_size
            percent = min(100.0, (downloaded / total_size) * 100.0)
            mb_downloaded = downloaded / (1024 * 1024)
            mb_total = total_size / (1024 * 1024)
            sys.stdout.write(f"\r  Progress: {percent:.1f}% ({mb_downloaded:.1f}/{mb_total:.1f} MB)")
            sys.stdout.flush()

    headers = {"User-Agent": "DeepGuard-AI/1.0 (Google Colab Automated Downloader)"}
    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req) as resp, open(output_path, "wb") as out_file:
        total_size = int(resp.headers.get("Content-Length", -1))
        block_size = 1024 * 1024  # 1 MB blocks
        downloaded = 0
        while True:
            chunk = resp.read(block_size)
            if not chunk:
                break
            out_file.write(chunk)
            downloaded += len(chunk)
            if total_size > 0:
                percent = min(100.0, (downloaded / total_size) * 100.0)
                sys.stdout.write(f"\r  Downloaded: {downloaded / (1024*1024):.1f}/{total_size / (1024*1024):.1f} MB ({percent:.1f}%)")
                sys.stdout.flush()
        print("\n[Downloader] Download completed successfully.")
        
    return output_path


def extract_zip(zip_path: str, extract_dir: str) -> str:
    """Extract a zip archive into target directory."""
    os.makedirs(extract_dir, exist_ok=True)
    print(f"[Downloader] Extracting {zip_path} -> {extract_dir} ...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(extract_dir)
    print("[Downloader] Extraction completed.")
    return extract_dir


def download_openrl_deepfake(
    target_dir: str = "/content/data",
    download_real: bool = True,
    download_fake: bool = True,
    max_images_per_class: Optional[int] = None
) -> Tuple[str, str]:
    """
    Direct URL download of OpenRL/DeepFakeFace from Hugging Face.
    Contains Real human faces (wiki.zip) and InsightFace face-swapped deepfakes (insight.zip).
    Requires NO login and NO API credentials.
    """
    os.makedirs(target_dir, exist_ok=True)
    real_dir = os.path.join(target_dir, "real")
    fake_dir = os.path.join(target_dir, "fake")

    # Real faces (IMDB-WIKI reference face images)
    if download_real and not os.path.exists(real_dir):
        real_url = "https://huggingface.co/datasets/OpenRL/DeepFakeFace/resolve/main/wiki.zip"
        zip_path = os.path.join(target_dir, "wiki.zip")
        download_file_with_progress(real_url, zip_path)
        extract_zip(zip_path, real_dir)
        try:
            os.remove(zip_path)
        except OSError:
            pass

    # Fake faces (InsightFace face swaps)
    if download_fake and not os.path.exists(fake_dir):
        fake_url = "https://huggingface.co/datasets/OpenRL/DeepFakeFace/resolve/main/insight.zip"
        zip_path = os.path.join(target_dir, "insight.zip")
        download_file_with_progress(fake_url, zip_path)
        extract_zip(zip_path, fake_dir)
        try:
            os.remove(zip_path)
        except OSError:
            pass

    return real_dir, fake_dir


def build_manifest_from_folders(
    real_dir: str,
    fake_dir: str,
    manifest_path: str = "/content/data/manifest.csv",
    max_per_class: Optional[int] = None,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42
) -> pd.DataFrame:
    """
    Scan real and fake directories, extract image paths, labels, and generate
    reproducible train/val/test splits without identity leakage.
    """
    records = []

    # Gather real images
    real_files = glob.glob(os.path.join(real_dir, "**", "*.[jJ][pP]*[gG]"), recursive=True) + \
                 glob.glob(os.path.join(real_dir, "**", "*.png"), recursive=True)
    real_files.sort()
    if max_per_class:
        real_files = real_files[:max_per_class]

    for p in real_files:
        # Use parent folder or file prefix as identity grouping source_id
        parent_name = os.path.basename(os.path.dirname(p))
        records.append({
            "image_path": p,
            "label": 0,
            "class_name": "REAL",
            "source_id": parent_name if parent_name and parent_name != "real" else os.path.splitext(os.path.basename(p))[0][:8]
        })

    # Gather fake images
    fake_files = glob.glob(os.path.join(fake_dir, "**", "*.[jJ][pP]*[gG]"), recursive=True) + \
                 glob.glob(os.path.join(fake_dir, "**", "*.png"), recursive=True)
    fake_files.sort()
    if max_per_class:
        fake_files = fake_files[:max_per_class]

    for p in fake_files:
        parent_name = os.path.basename(os.path.dirname(p))
        records.append({
            "image_path": p,
            "label": 1,
            "class_name": "FAKE",
            "source_id": parent_name if parent_name and parent_name != "fake" else os.path.splitext(os.path.basename(p))[0][:8]
        })

    df = pd.DataFrame(records)
    print(f"[Manifest] Found {len(real_files)} REAL and {len(fake_files)} FAKE face crops.")

    # Identity-based splitting to prevent leakage
    unique_sources = df["source_id"].unique()
    import numpy as np
    np.random.seed(seed)
    np.random.shuffle(unique_sources)

    n_val = int(len(unique_sources) * val_ratio)
    n_test = int(len(unique_sources) * test_ratio)

    val_sources = set(unique_sources[:n_val])
    test_sources = set(unique_sources[n_val:n_val + n_test])
    train_sources = set(unique_sources[n_val + n_test:])

    def assign_split(s_id):
        if s_id in val_sources:
            return "val"
        elif s_id in test_sources:
            return "test"
        return "train"

    df["split"] = df["source_id"].apply(assign_split)
    
    os.makedirs(os.path.dirname(os.path.abspath(manifest_path)), exist_ok=True)
    df.to_csv(manifest_path, index=False)
    print(f"[Manifest] Saved manifest to {manifest_path}")
    print(f"  Train: {(df['split']=='train').sum()} ({df[df['split']=='train']['class_name'].value_counts().to_dict()})")
    print(f"  Val:   {(df['split']=='val').sum()} ({df[df['split']=='val']['class_name'].value_counts().to_dict()})")
    print(f"  Test:  {(df['split']=='test').sum()} ({df[df['split']=='test']['class_name'].value_counts().to_dict()})")
    return df
