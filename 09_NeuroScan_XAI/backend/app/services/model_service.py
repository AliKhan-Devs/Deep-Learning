import time
import uuid
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from torchvision import transforms
import cv2

from app.config import settings
from app.core.logging import logger
from app.models.densenet import NeuroScanDenseNet
from app.services.xai_service import XAIEngine
from app.services.uncertainty_service import uncertainty_service
from app.models.schemas import DiagnosticResult, ProbabilityItem

class ModelService:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.classes = settings.CLASSES
        self.model: NeuroScanDenseNet = None
        self.xai_engine: XAIEngine = None
        self.transform = None
        self._load_model()

    def _load_model(self):
        logger.info("Initializing NeuroScan DenseNet-121 on device: %s", self.device)
        self.model = NeuroScanDenseNet(num_classes=len(self.classes))
        
        if settings.MODEL_PATH.exists():
            checkpoint = torch.load(settings.MODEL_PATH, map_location=self.device)
            state_dict = checkpoint.get("model_state_dict", checkpoint)
            self.model.load_state_dict(state_dict)
            self.model.to(self.device)
            self.model.eval()
            logger.info("Successfully loaded checkpoint from: %s", settings.MODEL_PATH)
        else:
            logger.warning("Checkpoint %s not found. Initialized with uninitialized weights.", settings.MODEL_PATH)

        self.transform = transforms.Compose([
            transforms.Resize((settings.IMAGE_SIZE, settings.IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=settings.NORM_MEAN, std=settings.NORM_STD)
        ])

        target_layer = self.model.get_target_layer()
        self.xai_engine = XAIEngine(self.model, target_layer, self.device)

    def analyze_scan(self, image: Image.Image, scan_name: str = "mri_scan") -> DiagnosticResult:
        start_time = time.time()
        scan_id = str(uuid.uuid4())[:8]

        # Ensure RGB format
        image_rgb = image.convert("RGB")
        original_np = np.array(image_rgb)
        
        # Prepare input tensor
        input_tensor = self.transform(image_rgb).unsqueeze(0).to(self.device)

        # Forward pass
        self.model.eval()
        with torch.no_grad():
            logits = self.model(input_tensor)
            probs_t = F.softmax(logits, dim=1)
            probs = probs_t.cpu().numpy()[0]

        pred_idx = int(np.argmax(probs))
        pred_class = self.classes[pred_idx]
        confidence = float(probs[pred_idx])
        has_tumor = (pred_class != "notumor")

        # Uncertainty Calculation (Shannon Entropy)
        entropy = uncertainty_service.compute_shannon_entropy(probs)
        risk_level, risk_desc = uncertainty_service.evaluate_clinical_risk(entropy, confidence)

        # Build probabilities list
        prob_items = [
            ProbabilityItem(
                class_name=cls_name,
                probability=round(float(p), 4),
                percentage=round(float(p) * 100, 2)
            )
            for cls_name, p in zip(self.classes, probs)
        ]
        # Sort descending by probability
        prob_items.sort(key=lambda x: x.probability, reverse=True)

        # XAI Generation (Grad-CAM and Grad-CAM++)
        cam_gradcam = self.xai_engine.compute_gradcam(input_tensor, pred_idx)
        cam_gradcam_pp = self.xai_engine.compute_gradcam_plus_plus(input_tensor, pred_idx)

        # Render Colorized Overlays
        gradcam_jet = self.xai_engine.render_overlay(original_np, cam_gradcam, cv2.COLORMAP_JET, alpha=0.45)
        gradcam_pp_jet = self.xai_engine.render_overlay(original_np, cam_gradcam_pp, cv2.COLORMAP_JET, alpha=0.45)
        gradcam_turbo = self.xai_engine.render_overlay(original_np, cam_gradcam, cv2.COLORMAP_TURBO, alpha=0.45)
        gradcam_viridis = self.xai_engine.render_overlay(original_np, cam_gradcam, cv2.COLORMAP_VIRIDIS, alpha=0.45)

        # Extract Tumor Contours
        contours_overlay, bboxes = self.xai_engine.extract_tumor_contours(
            original_np, cam_gradcam_pp if has_tumor else cam_gradcam, threshold=0.50
        )

        # Convert to Base64
        original_b64 = self.xai_engine.to_base64_jpeg(original_np)
        gradcam_jet_b64 = self.xai_engine.to_base64_jpeg(gradcam_jet)
        gradcam_pp_jet_b64 = self.xai_engine.to_base64_jpeg(gradcam_pp_jet)
        gradcam_turbo_b64 = self.xai_engine.to_base64_jpeg(gradcam_turbo)
        gradcam_viridis_b64 = self.xai_engine.to_base64_jpeg(gradcam_viridis)
        contours_b64 = self.xai_engine.to_base64_jpeg(contours_overlay)

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return DiagnosticResult(
            scan_id=scan_id,
            predicted_class=pred_class,
            confidence=round(confidence, 4),
            entropy=round(entropy, 4),
            risk_level=risk_level,
            risk_description=risk_desc,
            has_tumor=has_tumor,
            probabilities=prob_items,
            original_b64=original_b64,
            gradcam_jet_b64=gradcam_jet_b64,
            gradcam_pp_jet_b64=gradcam_pp_jet_b64,
            gradcam_turbo_b64=gradcam_turbo_b64,
            gradcam_viridis_b64=gradcam_viridis_b64,
            contours_overlay_b64=contours_b64,
            bounding_boxes=bboxes if has_tumor else [],
            inference_time_ms=elapsed_ms
        )

model_service = ModelService()
