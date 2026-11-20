import os
import cv2
import time
import base64
from typing import Dict, List, Any, Optional
from app.config import settings
from app.services.detector_service import detector_service

class VideoDetectionService:
    def __init__(self):
        self.detector = detector_service

    def process_video(
        self,
        video_path: str,
        conf_threshold: float = settings.DEFAULT_CONF_THRESHOLD,
        sample_rate: int = 2,  # Process every Nth frame to optimize speed
        model_id: Optional[str] = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError(f"Could not open video file at {video_path}")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        duration_sec = round(total_frames / fps, 2) if fps > 0 else 0

        frame_index = 0
        processed_frames_count = 0
        total_mask_detections = 0
        total_no_mask_detections = 0
        timeline_data: List[Dict[str, Any]] = []
        violation_keyframes: List[Dict[str, Any]] = []

        # Create output video path
        output_filename = f"processed_{os.path.basename(video_path)}"
        output_path = os.path.join(settings.TEMP_DIR, output_filename)
        
        # Use mp4v or avc1 codec
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, max(1.0, fps / sample_rate), (width, height))

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_index % sample_rate == 0:
                res = self.detector.detect_cv2_frame(
                    frame=frame,
                    conf_threshold=conf_threshold,
                    model_id=model_id
                )
                processed_frames_count += 1
                annotated_frame = res["annotated_frame"]
                out.write(annotated_frame)

                timestamp_sec = round(frame_index / fps, 2)
                m_count = res["mask_count"]
                nm_count = res["no_mask_count"]
                total_f = res["total_faces"]

                total_mask_detections += m_count
                total_no_mask_detections += nm_count

                timeline_data.append({
                    "frame_index": frame_index,
                    "timestamp": timestamp_sec,
                    "total_faces": total_f,
                    "mask_count": m_count,
                    "no_mask_count": nm_count,
                    "is_compliant": (nm_count == 0)
                })

                # Capture keyframes of violations (up to 8 samples)
                if nm_count > 0 and len(violation_keyframes) < 8:
                    _, buf = cv2.imencode(".jpg", annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                    thumb_b64 = "data:image/jpeg;base64," + base64.b64encode(buf).decode("utf-8")
                    violation_keyframes.append({
                        "frame_index": frame_index,
                        "timestamp": timestamp_sec,
                        "no_mask_count": nm_count,
                        "thumbnail": thumb_b64
                    })

            frame_index += 1

        cap.release()
        out.release()

        processing_time = round(time.time() - start_time, 2)
        total_detections = total_mask_detections + total_no_mask_detections
        overall_compliance = round((total_mask_detections / total_detections * 100), 1) if total_detections > 0 else 100.0

        return {
            "duration_seconds": duration_sec,
            "total_video_frames": total_frames,
            "processed_frames": processed_frames_count,
            "fps": fps,
            "resolution": f"{width}x{height}",
            "processing_time_sec": processing_time,
            "total_mask_detections": total_mask_detections,
            "total_no_mask_detections": total_no_mask_detections,
            "overall_compliance_rate": overall_compliance,
            "has_violations": (total_no_mask_detections > 0),
            "timeline": timeline_data[::max(1, len(timeline_data) // 40)],  # Downsample for frontend graph
            "violation_keyframes": violation_keyframes,
            "output_video_path": output_path,
            "video_url": f"/temp_videos/{output_filename}"
        }

video_detection_service = VideoDetectionService()
