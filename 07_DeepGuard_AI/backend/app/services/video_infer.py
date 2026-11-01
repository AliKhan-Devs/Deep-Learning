import os
import time
import uuid
from typing import Dict, Any, List
import cv2
import numpy as np
import torch
from torchvision import transforms
from PIL import Image

from ..config import settings
from ..core.logging import logger
from ..core.exceptions import FileValidationError, CheckpointMissingError, VideoProcessingError
from ..models.schemas import VideoAnalysisResponse, VideoFrameDetail
from .model_manager import model_manager
from .face_detector import face_detector
from .aggregator import score_aggregator
from .history_service import history_service


class VideoInferenceService:
    """
    Video deepfake forensic analysis pipeline.
    Runs asynchronous background frame extraction, face detection, batch inference,
    outlier-resilient score aggregation, and persistent status tracking.
    """

    def start_video_analysis(
        self,
        file_bytes: bytes,
        original_filename: str,
        model_name: str = settings.DEFAULT_MODEL
    ) -> str:
        """
        Validates video file and enqueues background processing.
        Returns analysis_id immediately for polling.
        """
        analysis_id = str(uuid.uuid4())

        # 1. Validate File Format & Size
        ext = os.path.splitext(original_filename.lower())[1]
        if ext not in settings.ALLOWED_VIDEO_EXTENSIONS:
            raise FileValidationError(
                f"Unsupported video format '{ext}'. Allowed: {list(settings.ALLOWED_VIDEO_EXTENSIONS)}"
            )

        if len(file_bytes) > settings.MAX_VIDEO_SIZE_BYTES:
            raise FileValidationError(
                f"Video size exceeds limit of {settings.MAX_VIDEO_SIZE_BYTES / (1024*1024):.1f} MB."
            )

        # 2. Check model availability before queuing
        if not model_manager.is_checkpoint_available(model_name):
            expected = model_manager.get_checkpoint_path(model_name)
            raise CheckpointMissingError(model_name, str(expected))

        # 3. Save Upload
        save_filename = f"{analysis_id}{ext}"
        saved_path = settings.UPLOAD_DIR / save_filename
        with open(saved_path, "wb") as f:
            f.write(file_bytes)

        # 4. Create PENDING entry in database
        initial_record = {
            "analysis_id": analysis_id,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "media_type": "video",
            "original_filename": original_filename,
            "model_name": model_name,
            "status": "PENDING",
            "progress_pct": 0,
        }
        history_service.save_analysis(initial_record, file_path=str(saved_path))
        return analysis_id

    def process_video_task(self, analysis_id: str, file_path: str, model_name: str) -> None:
        """
        Background worker executing the video analysis pipeline.
        """
        start_time = time.perf_counter()
        logger.info(f"Starting video background analysis {analysis_id}...")

        try:
            history_service.update_status(analysis_id, status="PROCESSING", progress_pct=10)

            # 1. Acquire Model
            model, config = model_manager.get_model(model_name)
            device = model_manager.device
            input_size = tuple(config.get("input_size", [224, 224]))
            mean = config.get("mean", [0.485, 0.456, 0.406])
            std = config.get("std", [0.229, 0.224, 0.225])

            transform = transforms.Compose([
                transforms.ToTensor(),
                transforms.Normalize(mean=mean, std=std),
            ])

            # 2. Open Video
            cap = cv2.VideoCapture(file_path)
            if not cap.isOpened():
                raise VideoProcessingError(f"OpenCV failed to open video file: {file_path}")

            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = float(cap.get(cv2.CAP_PROP_FPS))
            if fps <= 0:
                fps = 25.0

            step = max(1, int(round(fps * settings.VIDEO_SAMPLE_INTERVAL_SEC)))
            frame_records: List[Dict[str, Any]] = []
            frame_idx = 0
            sampled_count = 0

            # 3. Controlled Frame Sampling Loop
            while True:
                ret, frame_bgr = cap.read()
                if not ret or sampled_count >= settings.VIDEO_MAX_FRAMES:
                    break

                if frame_idx % step == 0:
                    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
                    timestamp = round(frame_idx / fps, 3)

                    # Face Detection
                    crops = face_detector.crop_faces(frame_rgb, target_size=input_size)
                    faces_count = len(crops)
                    frame_fake_prob = 0.0
                    frame_boxes = []

                    if faces_count > 0:
                        batch_tensors = []
                        for crop_np, det in crops:
                            pil_crop = Image.fromarray(crop_np)
                            batch_tensors.append(transform(pil_crop))
                            frame_boxes.append(det["bbox"])

                        batch = torch.stack(batch_tensors).to(device)
                        with torch.no_grad():
                            logits = model(batch)
                            probs = torch.softmax(logits, dim=1).cpu().numpy()

                        # Take maximum fake probability among detected faces in this frame
                        frame_fake_prob = float(np.max(probs[:, 1]))

                    frame_real_prob = float(max(0.0, min(1.0, 1.0 - frame_fake_prob)))
                    is_suspicious = bool(frame_fake_prob >= settings.SUSPICIOUS_FRAME_THRESHOLD)

                    # Save thumbnail for visual inspection
                    thumb_filename = f"{analysis_id}_frame_{frame_idx}.jpg"
                    thumb_path = settings.THUMBNAILS_DIR / thumb_filename
                    thumb_bgr = cv2.resize(frame_bgr, (240, 135), interpolation=cv2.INTER_AREA)
                    cv2.imwrite(str(thumb_path), thumb_bgr)

                    frame_records.append({
                        "frame_index": frame_idx,
                        "timestamp_sec": timestamp,
                        "thumbnail_path": str(thumb_path),
                        "faces_count": faces_count,
                        "fake_probability": round(frame_fake_prob, 4),
                        "real_probability": round(frame_real_prob, 4),
                        "is_suspicious": is_suspicious,
                        "face_boxes_json": str(frame_boxes),
                    })
                    sampled_count += 1

                    # Update progress
                    progress = int(10 + (sampled_count / settings.VIDEO_MAX_FRAMES) * 75)
                    history_service.update_status(analysis_id, status="PROCESSING", progress_pct=min(85, progress))

                frame_idx += 1

            cap.release()

            # 4. Aggregation
            history_service.update_status(analysis_id, status="PROCESSING", progress_pct=90)
            agg_result = score_aggregator.aggregate(frame_records)

            elapsed = time.perf_counter() - start_time

            # 5. Save Frame Breakdown to DB
            history_service.save_video_frames(analysis_id, frame_records)

            # 6. Finalize Analysis in DB
            history_service.complete_analysis(
                analysis_id=analysis_id,
                prediction=agg_result["prediction"],
                fake_prob=agg_result["fake_probability"],
                real_prob=agg_result["real_probability"],
                frames_analyzed=agg_result["frames_analyzed"],
                frames_with_faces=agg_result["frames_with_faces"],
                suspicious_count=agg_result["suspicious_frames_count"],
                duration_sec=round(elapsed, 3),
            )
            logger.info(f"Video analysis {analysis_id} COMPLETED in {elapsed:.2f}s: {agg_result['prediction']}")

        except Exception as e:
            logger.error(f"Video analysis {analysis_id} FAILED: {str(e)}", exc_info=True)
            history_service.fail_analysis(analysis_id, error_message=str(e))


# Global singleton instance
video_infer_service = VideoInferenceService()
