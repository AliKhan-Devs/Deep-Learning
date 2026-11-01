import cv2
import numpy as np
from typing import List, Dict, Any, Generator, Tuple


class VideoSampler:
    """
    Controlled video reader and frame sampler.
    Prevents indiscriminate frame loading by extracting frames at configured intervals
    (e.g., 1 frame per 0.5 - 1.0 seconds) up to a safety ceiling.
    """

    def __init__(
        self,
        sample_rate_sec: float = 0.5,
        max_frames: int = 60,
        target_fps: float = 2.0
    ):
        """
        Args:
            sample_rate_sec: Desired interval between sampled frames in seconds.
            max_frames: Maximum number of frames to extract per video.
            target_fps: Alternative rate specification in frames per second.
        """
        self.sample_rate_sec = sample_rate_sec
        self.max_frames = max_frames
        self.target_fps = target_fps

    def extract_metadata(self, video_path: str) -> Dict[str, Any]:
        """Reads basic container metadata from video file."""
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise FileNotFoundError(f"Unable to open video: {video_path}")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = float(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration = total_frames / fps if fps > 0 else 0.0

        cap.release()
        return {
            "total_frames": total_frames,
            "fps": round(fps, 2),
            "width": width,
            "height": height,
            "duration_sec": round(duration, 2),
        }

    def sample_frames(self, video_path: str) -> List[Dict[str, Any]]:
        """
        Extracts sampled frames with their timestamp and frame index.

        Returns:
            List of dicts: [
                {"frame_index": int, "timestamp_sec": float, "frame_rgb": np.ndarray}
            ]
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise FileNotFoundError(f"Unable to open video: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0:
            fps = 25.0  # Fallback assumption

        step = max(1, int(round(fps * self.sample_rate_sec)))
        frames = []
        current_idx = 0

        while True:
            ret, frame_bgr = cap.read()
            if not ret or len(frames) >= self.max_frames:
                break

            if current_idx % step == 0:
                frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
                timestamp = current_idx / fps
                frames.append({
                    "frame_index": current_idx,
                    "timestamp_sec": round(timestamp, 3),
                    "frame_rgb": frame_rgb
                })

            current_idx += 1

        cap.release()
        return frames
