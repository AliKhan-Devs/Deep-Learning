import io
import base64
import cv2
import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F
from app.core.logging import logger
from app.models.schemas import BoundingBox

class XAIEngine:
    def __init__(self, model: torch.nn.Module, target_layer: torch.nn.Module, device: torch.device):
        self.model = model
        self.target_layer = target_layer
        self.device = device
        self.activations = None
        self.gradients = None
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, input_t, output_t):
            self.activations = output_t.detach()

        def backward_hook(module, grad_in, grad_out):
            self.gradients = grad_out[0].detach()

        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_full_backward_hook(backward_hook)
        logger.info("Registered forward and backward hooks for target layer.")

    def compute_gradcam(self, input_tensor: torch.Tensor, target_class_idx: int) -> np.ndarray:
        """
        Computes standard Grad-CAM heatmap normalized to [0, 1].
        """
        self.model.eval()
        self.model.zero_grad()

        logits = self.model(input_tensor)
        score = logits[0, target_class_idx]
        score.backward(retain_graph=True)

        if self.gradients is None or self.activations is None:
            raise RuntimeError("Gradients or activations not captured during backward pass.")

        alpha_k = torch.mean(self.gradients, dim=(2, 3), keepdim=True)
        cam = torch.sum(alpha_k * self.activations, dim=1, keepdim=True)
        cam = F.relu(cam)

        cam_np = cam.squeeze().cpu().numpy()
        min_v, max_v = cam_np.min(), cam_np.max()
        cam_norm = (cam_np - min_v) / (max_v - min_v + 1e-8)
        
        # Resize to input dimensions
        cam_resized = cv2.resize(cam_norm, (input_tensor.shape[3], input_tensor.shape[2]))
        return cam_resized

    def compute_gradcam_plus_plus(self, input_tensor: torch.Tensor, target_class_idx: int) -> np.ndarray:
        """
        Computes high-order Grad-CAM++ heatmap normalized to [0, 1].
        """
        self.model.eval()
        self.model.zero_grad()

        logits = self.model(input_tensor)
        score = logits[0, target_class_idx]
        score.backward(retain_graph=True)

        grads = self.gradients[0]  # [C, H, W]
        acts = self.activations[0] # [C, H, W]

        grads_sq = grads ** 2
        grads_cu = grads ** 3
        sum_acts = torch.sum(acts, dim=(1, 2), keepdim=True)

        eps = 1e-8
        aij = grads_sq / (2 * grads_sq + sum_acts * grads_cu + eps)
        aij = torch.where(grads != 0, aij, torch.zeros_like(aij))

        weights = torch.sum(aij * F.relu(grads), dim=(1, 2), keepdim=True)
        cam = torch.sum(weights * acts, dim=0)
        cam = F.relu(cam).cpu().numpy()

        min_v, max_v = cam.min(), cam.max()
        cam_norm = (cam - min_v) / (max_v - min_v + 1e-8)
        cam_resized = cv2.resize(cam_norm, (input_tensor.shape[3], input_tensor.shape[2]))
        return cam_resized

    @staticmethod
    def render_overlay(
        original_rgb: np.ndarray,
        cam_map: np.ndarray,
        colormap: int = cv2.COLORMAP_JET,
        alpha: float = 0.45
    ) -> np.ndarray:
        """
        Renders an alpha-blended heatmap on top of the original RGB image.
        """
        heatmap_uint8 = np.uint8(255 * np.clip(cam_map, 0, 1))
        heatmap_colored = cv2.applyColorMap(heatmap_uint8, colormap)
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        
        # Resize heatmap if dimensions don't match original
        if heatmap_colored.shape[:2] != original_rgb.shape[:2]:
            heatmap_colored = cv2.resize(heatmap_colored, (original_rgb.shape[1], original_rgb.shape[0]))
            
        overlay = np.uint8(alpha * heatmap_colored + (1.0 - alpha) * original_rgb)
        return overlay

    @staticmethod
    def extract_tumor_contours(
        original_rgb: np.ndarray,
        cam_map: np.ndarray,
        threshold: float = 0.55
    ) -> tuple[np.ndarray, list[BoundingBox]]:
        """
        Thresholds the activation map to detect the primary tumor focus,
        draws emerald contours, and extracts bounding boxes.
        """
        h, w = original_rgb.shape[:2]
        cam_resized = cv2.resize(cam_map, (w, h))
        
        # Create binary mask for top activations
        mask = np.uint8((cam_resized >= threshold) * 255)
        
        # Morphological opening to clean small speckles
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        mask_clean = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        
        contours, _ = cv2.findContours(mask_clean, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        overlay = original_rgb.copy()
        bboxes: list[BoundingBox] = []
        
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area > 100: # Filter out tiny noise contours
                x, y, bw, bh = cv2.boundingRect(cnt)
                # Compute average confidence inside contour
                roi = cam_resized[y:y+bh, x:x+bw]
                avg_score = float(np.mean(roi)) if roi.size > 0 else 0.0
                
                # Draw high-visibility cyan/emerald contour and glowing box
                cv2.drawContours(overlay, [cnt], -1, (16, 185, 129), 2)
                cv2.rectangle(overlay, (x, y), (x + bw, y + bh), (6, 182, 212), 2)
                
                bboxes.append(BoundingBox(
                    x=int(x),
                    y=int(y),
                    w=int(bw),
                    h=int(bh),
                    confidence_score=round(avg_score, 3)
                ))
                
        return overlay, bboxes

    @staticmethod
    def to_base64_jpeg(image_rgb: np.ndarray, quality: int = 90) -> str:
        """
        Converts RGB numpy array to base64 JPEG data URL.
        """
        pil_img = Image.fromarray(image_rgb)
        buffered = io.BytesIO()
        pil_img.save(buffered, format="JPEG", quality=quality)
        b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{b64_str}"
