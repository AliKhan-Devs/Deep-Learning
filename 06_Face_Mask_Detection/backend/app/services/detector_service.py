import os
import cv2
import numpy as np
import base64
import time
from typing import Dict, List, Any, Optional
from app.config import settings

class FaceMaskDetectorService:
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.active_model_id = settings.DEFAULT_MODEL_ID
        self.model_configs = {
            "v1": {
                "name": "YOLOv8n (Experiment 1)",
                "path": settings.MODEL_V1_PATH,
                "type": "Nano",
                "mAP50": 0.9138,
                "mAP50_95": 0.5298,
                "precision": 0.8686,
                "recall": 0.8515,
            },
            "v2": {
                "name": "YOLOv26n (Experiment 2)",
                "path": settings.MODEL_V2_PATH,
                "type": "Nano-Enhanced",
                "mAP50": 0.9046,
                "mAP50_95": 0.5363,
                "precision": 0.9213,
                "recall": 0.8063,
            },
            "v3": {
                "name": "YOLOv26s (Experiment 3 — Champion)",
                "path": settings.MODEL_V3_PATH,
                "type": "Small-Champion",
                "mAP50": 0.9044,
                "mAP50_95": 0.5585,
                "precision": 0.9150,
                "recall": 0.8482,
            }
        }
        self._load_model(self.active_model_id)

    def _load_model(self, model_id: str):
        if model_id not in self.model_configs:
            model_id = settings.DEFAULT_MODEL_ID
            
        if model_id in self.models:
            return self.models[model_id]

        model_path = self.model_configs[model_id]["path"]
        if not os.path.exists(model_path):
            print(f"[DetectorService] Warning: Model file not found at {model_path}")
            return None

        try:
            from ultralytics import YOLO
            print(f"[DetectorService] Loading {model_id} from {model_path}...")
            model = YOLO(model_path)
            self.models[model_id] = model
            print(f"[DetectorService] Successfully loaded {model_id} ({self.model_configs[model_id]['name']})")
            return model
        except Exception as e:
            print(f"[DetectorService] Failed to load model {model_id}: {e}")
            return None

    def get_model(self, model_id: Optional[str] = None):
        target_id = model_id or self.active_model_id
        if target_id not in self.models:
            self._load_model(target_id)
        return self.models.get(target_id)

    def detect_image(
        self,
        image_bytes: bytes,
        conf_threshold: float = settings.DEFAULT_CONF_THRESHOLD,
        iou_threshold: float = settings.DEFAULT_IOU_THRESHOLD,
        model_id: Optional[str] = None
    ) -> Dict[str, Any]:
        start_time = time.time()
        target_model_id = model_id or self.active_model_id
        if target_model_id not in self.model_configs:
            target_model_id = settings.DEFAULT_MODEL_ID

        # Decode image
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Could not decode image from provided bytes.")

        h, w, _ = frame.shape
        model = self.get_model(target_model_id)

        detections = []
        annotated_frame = frame.copy()

        if model is not None:
            # Run inference
            results = model.predict(
                source=frame,
                conf=conf_threshold,
                iou=iou_threshold,
                verbose=False
            )
            
            if len(results) > 0 and results[0].boxes is not None:
                boxes = results[0].boxes
                for box in boxes:
                    xyxy = box.xyxy[0].cpu().numpy().tolist()
                    conf = float(box.conf[0].cpu().numpy())
                    cls_id = int(box.cls[0].cpu().numpy())
                    
                    # class 0: no_mask, class 1: mask
                    cls_name = "mask" if cls_id == 1 else "no_mask"
                    label_text = f"{cls_name.upper()} {conf * 100:.1f}%"

                    x1, y1, x2, y2 = [int(v) for v in xyxy]
                    # Clamp to dimensions
                    x1, y1 = max(0, x1), max(0, y1)
                    x2, y2 = min(w, x2), min(h, y2)

                    color = (0, 204, 102) if cls_id == 1 else (40, 40, 235) # BGR: Emerald green for mask, Crimson red for no_mask

                    # Draw stylish rounded/accented box
                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2, cv2.LINE_AA)
                    
                    # Corner accents
                    line_len = min(int((x2 - x1) * 0.2), int((y2 - y1) * 0.2), 20)
                    if line_len > 4:
                        cv2.line(annotated_frame, (x1, y1), (x1 + line_len, y1), color, 4, cv2.LINE_AA)
                        cv2.line(annotated_frame, (x1, y1), (x1, y1 + line_len), color, 4, cv2.LINE_AA)
                        cv2.line(annotated_frame, (x2, y1), (x2 - line_len, y1), color, 4, cv2.LINE_AA)
                        cv2.line(annotated_frame, (x2, y1), (x2, y1 + line_len), color, 4, cv2.LINE_AA)
                        cv2.line(annotated_frame, (x1, y2), (x1 + line_len, y2), color, 4, cv2.LINE_AA)
                        cv2.line(annotated_frame, (x1, y2), (x1, y2 - line_len), color, 4, cv2.LINE_AA)
                        cv2.line(annotated_frame, (x2, y2), (x2 - line_len, y2), color, 4, cv2.LINE_AA)
                        cv2.line(annotated_frame, (x2, y2), (x2, y2 - line_len), color, 4, cv2.LINE_AA)

                    # Draw label badge
                    (tw, th), baseline = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 2)
                    badge_y1 = max(0, y1 - th - 8)
                    badge_y2 = y1
                    badge_x2 = min(w, x1 + tw + 10)
                    cv2.rectangle(annotated_frame, (x1, badge_y1), (badge_x2, badge_y2), color, -1)
                    cv2.putText(
                        annotated_frame,
                        label_text,
                        (x1 + 5, y1 - 4),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.55,
                        (255, 255, 255),
                        2,
                        cv2.LINE_AA
                    )

                    detections.append({
                        "box": [x1, y1, x2, y2],
                        "normalized_box": [round(x1/w, 4), round(y1/h, 4), round(x2/w, 4), round(y2/h, 4)],
                        "class_id": cls_id,
                        "class_name": cls_name,
                        "confidence": round(conf, 4),
                        "status": "COMPLIANT" if cls_id == 1 else "NON_COMPLIANT"
                    })

        inference_time_ms = round((time.time() - start_time) * 1000, 2)
        mask_count = sum(1 for d in detections if d["class_id"] == 1)
        no_mask_count = sum(1 for d in detections if d["class_id"] == 0)
        total_faces = len(detections)
        compliance_rate = round((mask_count / total_faces * 100), 1) if total_faces > 0 else 100.0

        # Encode annotated frame to JPEG base64
        _, buffer = cv2.imencode(".jpg", annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
        annotated_base64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode("utf-8")

        return {
            "model_used": target_model_id,
            "model_name": self.model_configs[target_model_id]["name"],
            "image_dimensions": {"width": w, "height": h},
            "total_faces": total_faces,
            "mask_count": mask_count,
            "no_mask_count": no_mask_count,
            "compliance_rate": compliance_rate,
            "status": "COMPLIANT" if no_mask_count == 0 else "WARNING_NON_COMPLIANT",
            "inference_time_ms": inference_time_ms,
            "detections": detections,
            "annotated_image": annotated_base64
        }

    def detect_cv2_frame(
        self,
        frame: np.ndarray,
        conf_threshold: float = settings.DEFAULT_CONF_THRESHOLD,
        iou_threshold: float = settings.DEFAULT_IOU_THRESHOLD,
        model_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Direct numpy frame inference for video processing"""
        start_time = time.time()
        target_model_id = model_id or self.active_model_id
        if target_model_id not in self.model_configs:
            target_model_id = settings.DEFAULT_MODEL_ID

        h, w, _ = frame.shape
        model = self.get_model(target_model_id)

        detections = []
        annotated_frame = frame.copy()

        if model is not None:
            results = model.predict(
                source=frame,
                conf=conf_threshold,
                iou=iou_threshold,
                verbose=False
            )
            
            if len(results) > 0 and results[0].boxes is not None:
                boxes = results[0].boxes
                for box in boxes:
                    xyxy = box.xyxy[0].cpu().numpy().tolist()
                    conf = float(box.conf[0].cpu().numpy())
                    cls_id = int(box.cls[0].cpu().numpy())
                    cls_name = "mask" if cls_id == 1 else "no_mask"
                    label_text = f"{cls_name.upper()} {conf * 100:.1f}%"

                    x1, y1, x2, y2 = [int(v) for v in xyxy]
                    x1, y1 = max(0, x1), max(0, y1)
                    x2, y2 = min(w, x2), min(h, y2)

                    color = (0, 204, 102) if cls_id == 1 else (40, 40, 235)

                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2, cv2.LINE_AA)
                    (tw, th), _ = cv2.getTextSize(label_text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
                    badge_y1 = max(0, y1 - th - 6)
                    cv2.rectangle(annotated_frame, (x1, badge_y1), (min(w, x1 + tw + 8), y1), color, -1)
                    cv2.putText(
                        annotated_frame,
                        label_text,
                        (x1 + 4, y1 - 3),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        (255, 255, 255),
                        2,
                        cv2.LINE_AA
                    )

                    detections.append({
                        "box": [x1, y1, x2, y2],
                        "normalized_box": [round(x1/w, 4), round(y1/h, 4), round(x2/w, 4), round(y2/h, 4)],
                        "class_id": cls_id,
                        "class_name": cls_name,
                        "confidence": round(conf, 4)
                    })

        inference_time_ms = round((time.time() - start_time) * 1000, 2)
        mask_count = sum(1 for d in detections if d["class_id"] == 1)
        no_mask_count = sum(1 for d in detections if d["class_id"] == 0)

        return {
            "annotated_frame": annotated_frame,
            "total_faces": len(detections),
            "mask_count": mask_count,
            "no_mask_count": no_mask_count,
            "inference_time_ms": inference_time_ms,
            "detections": detections
        }

detector_service = FaceMaskDetectorService()
