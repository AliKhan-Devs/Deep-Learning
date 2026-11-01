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
from ..core.exceptions import FileValidationError, CheckpointMissingError
from ..models.schemas import ImageAnalysisResponse, FacePrediction, BoundingBox, ExpandedBoundingBox
from .model_manager import model_manager
from .face_detector import face_detector
from .history_service import history_service


class ImageInferenceService:
    """
    Forensic image inference orchestrator.
    Executes face detection, exact training-matched normalization, model evaluation,
    and structured forensic reporting.
    """

    def analyze_image(
        self,
        file_bytes: bytes,
        original_filename: str,
        model_name: str = settings.DEFAULT_MODEL
    ) -> ImageAnalysisResponse:
        start_time = time.perf_counter()
        analysis_id = str(uuid.uuid4())

        # 1. File Validation
        ext = os.path.splitext(original_filename.lower())[1]
        if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
            raise FileValidationError(
                f"Unsupported image format '{ext}'. Allowed extensions: {list(settings.ALLOWED_IMAGE_EXTENSIONS)}"
            )

        if len(file_bytes) > settings.MAX_IMAGE_SIZE_BYTES:
            raise FileValidationError(
                f"Image size exceeds safety ceiling of {settings.MAX_IMAGE_SIZE_BYTES / (1024*1024):.1f} MB."
            )

        # 2. Persist Upload
        save_filename = f"{analysis_id}{ext}"
        saved_path = settings.UPLOAD_DIR / save_filename
        with open(saved_path, "wb") as f:
            f.write(file_bytes)

        # 3. Decode Image
        nparr = np.frombuffer(file_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise FileValidationError("Could not decode image file.")

        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

        # 4. Acquire Model (Raises CheckpointMissingError if not downloaded from Colab)
        model, config = model_manager.get_model(model_name)
        device = model_manager.device

        input_size = tuple(config.get("input_size", [224, 224]))
        mean = config.get("mean", [0.485, 0.456, 0.406])
        std = config.get("std", [0.229, 0.224, 0.225])
        decision_threshold = float(config.get("decision_threshold", 0.50))

        # 5. Extract Faces
        face_crops = face_detector.crop_faces(img_rgb, target_size=input_size)

        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=mean, std=std),
        ])

        face_predictions: List[FacePrediction] = []
        max_fake_prob = 0.0

        if not face_crops:
            # Zero faces detected
            elapsed = time.perf_counter() - start_time
            response = ImageAnalysisResponse(
                analysis_id=analysis_id,
                created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                media_type="image",
                original_filename=original_filename,
                model_name=model_name,
                status="COMPLETED",
                prediction="Inconclusive / insufficient analyzable content",
                fake_probability=0.0,
                real_probability=0.0,
                faces_detected_count=0,
                faces=[],
                execution_duration_sec=round(elapsed, 3),
            )
            history_service.save_analysis(response.model_dump(), file_path=str(saved_path))
            return response

        # 6. Run Inference per Face
        for idx, (crop_np, meta) in enumerate(face_crops):
            pil_img = Image.fromarray(crop_np)
            tensor = transform(pil_img).unsqueeze(0).to(device)

            with torch.no_grad():
                logits = model(tensor)
                probs = torch.softmax(logits, dim=1).cpu().numpy()[0]

            real_prob = float(probs[0])
            fake_prob = float(probs[1])

            if fake_prob > max_fake_prob:
                max_fake_prob = fake_prob

            label = "FAKE" if fake_prob >= decision_threshold else "REAL"
            confidence = fake_prob if label == "FAKE" else real_prob

            face_predictions.append(FacePrediction(
                face_index=idx,
                bbox=BoundingBox(**meta["bbox"]),
                expanded_bbox=ExpandedBoundingBox(**meta["expanded_bbox"]),
                fake_probability=round(fake_prob, 4),
                real_probability=round(real_prob, 4),
                predicted_label=label,
                confidence=round(confidence, 4),
                model_score=round(fake_prob, 4),
            ))

        # 7. Aggregate Image Verdict
        overall_verdict = "Likely Manipulated" if max_fake_prob >= decision_threshold else "Likely Authentic"
        overall_real_prob = float(max(0.0, min(1.0, 1.0 - max_fake_prob)))
        elapsed = time.perf_counter() - start_time

        response = ImageAnalysisResponse(
            analysis_id=analysis_id,
            created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            media_type="image",
            original_filename=original_filename,
            model_name=model_name,
            status="COMPLETED",
            prediction=overall_verdict,
            fake_probability=round(max_fake_prob, 4),
            real_probability=round(overall_real_prob, 4),
            faces_detected_count=len(face_predictions),
            faces=face_predictions,
            execution_duration_sec=round(elapsed, 3),
        )

        history_service.save_analysis(response.model_dump(), file_path=str(saved_path))
        return response


# Global singleton instance
image_infer_service = ImageInferenceService()
