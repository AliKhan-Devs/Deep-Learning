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
from ..models.schemas import (
    ImageAnalysisResponse,
    FacePrediction,
    BoundingBox,
    ExpandedBoundingBox,
    MultiModelComparisonResponse,
    ModelInferenceComparisonItem,
)
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

    def compare_models(
        self,
        file_bytes: bytes,
        original_filename: str
    ) -> MultiModelComparisonResponse:
        """
        Runs all three models (EfficientNet-B4 Champion, EfficientNet-B0, XceptionNet)
        concurrently or sequentially on the uploaded image to benchmark latency, FPS,
        and predictions side-by-side.
        """
        start_overall = time.perf_counter()
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

        # 2. Decode Image
        nparr = np.frombuffer(file_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise FileValidationError("Could not decode image file.")

        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

        # 3. Detect raw faces once using face_detector
        detected_faces = face_detector.detect(img_rgb)
        faces_count = len(detected_faces)

        model_order = ["efficientnet_b4", "efficientnet_b0", "xception"]
        results: List[ModelInferenceComparisonItem] = []

        device = model_manager.device

        for m_name in model_order:
            m_start = time.perf_counter()
            try:
                model, config = model_manager.get_model(m_name)
                input_size = tuple(config.get("input_size", [224, 224]))
                mean = config.get("mean", [0.485, 0.456, 0.406])
                std = config.get("std", [0.229, 0.224, 0.225])
                decision_threshold = float(config.get("decision_threshold", 0.50))
                display_name = config.get("display_name", m_name)
                arch = config.get("architecture", m_name)

                transform = transforms.Compose([
                    transforms.ToTensor(),
                    transforms.Normalize(mean=mean, std=std),
                ])

                if faces_count == 0:
                    # Center crop fallback
                    h, w = img_rgb.shape[:2]
                    min_dim = min(h, w)
                    crop = img_rgb[(h-min_dim)//2:(h+min_dim)//2, (w-min_dim)//2:(w+min_dim)//2]
                    crop_resized = cv2.resize(crop, input_size, interpolation=cv2.INTER_LINEAR)
                    pil_img = Image.fromarray(crop_resized)
                    tensor = transform(pil_img).unsqueeze(0).to(device)

                    with torch.no_grad():
                        logits = model(tensor)
                        probs = torch.softmax(logits, dim=1).cpu().numpy()[0]

                    real_prob = float(probs[0])
                    fake_prob = float(probs[1])
                else:
                    face_crops = face_detector.crop_faces(img_rgb, target_size=input_size)
                    max_fake = 0.0
                    for crop_np, _ in face_crops:
                        pil_img = Image.fromarray(crop_np)
                        tensor = transform(pil_img).unsqueeze(0).to(device)
                        with torch.no_grad():
                            logits = model(tensor)
                            probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
                        f_p = float(probs[1])
                        if f_p > max_fake:
                            max_fake = f_p
                    fake_prob = max_fake
                    real_prob = float(max(0.0, min(1.0, 1.0 - fake_prob)))

                m_elapsed = time.perf_counter() - m_start
                latency_ms = round(m_elapsed * 1000.0, 2)
                fps = round(1.0 / max(m_elapsed, 0.0001), 1)

                label = "Likely Manipulated" if fake_prob >= decision_threshold else "Likely Authentic"
                confidence = fake_prob if fake_prob >= decision_threshold else real_prob

                results.append(ModelInferenceComparisonItem(
                    model_name=m_name,
                    display_name=display_name,
                    architecture=arch,
                    is_champion=(m_name == "efficientnet_b4"),
                    latency_ms=latency_ms,
                    fps=fps,
                    prediction=label,
                    fake_probability=round(fake_prob, 4),
                    real_probability=round(real_prob, 4),
                    confidence=round(confidence, 4),
                    face_detected=(faces_count > 0),
                    faces_count=faces_count
                ))
            except Exception as e:
                logger.error(f"Error evaluating model {m_name} in compare: {e}")
                results.append(ModelInferenceComparisonItem(
                    model_name=m_name,
                    display_name=m_name,
                    architecture=m_name,
                    is_champion=(m_name == "efficientnet_b4"),
                    latency_ms=0.0,
                    fps=0.0,
                    prediction="Error",
                    fake_probability=0.0,
                    real_probability=0.0,
                    confidence=0.0,
                    face_detected=False,
                    faces_count=0
                ))

        return MultiModelComparisonResponse(
            analysis_id=analysis_id,
            created_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            original_filename=original_filename,
            faces_detected_count=faces_count,
            champion_model="efficientnet_b4",
            models=results
        )


# Global singleton instance
image_infer_service = ImageInferenceService()
