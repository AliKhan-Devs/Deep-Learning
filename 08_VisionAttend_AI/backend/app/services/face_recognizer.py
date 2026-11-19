import torch
import numpy as np
from typing import List, Tuple, Dict, Any, Optional
from facenet_pytorch import InceptionResnetV1
from ..config import settings
from ..core.logging import logger


class FaceRecognizer:
    """
    Deep Face Feature Extraction & Metric Matching Engine.
    Employs Inception-ResNet-v1 (FaceNet) trained on VGGFace2.
    Produces 512-dimensional L2-normalized embedding vectors.
    """

    def __init__(self, device: Optional[str] = None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        try:
            self.model = InceptionResnetV1(pretrained="vggface2").eval().to(self.device)
            logger.info(f"Loaded InceptionResnetV1 (FaceNet) on device: {self.device}")
        except Exception as e:
            logger.error(f"Error loading InceptionResnetV1: {e}")
            raise e

    def extract_embedding(self, face_rgb_160: np.ndarray) -> np.ndarray:
        """
        Extracts an L2-normalized 512-dimensional embedding vector from a 160x160 RGB face crop.
        """
        if face_rgb_160.shape != (160, 160, 3):
            import cv2
            face_rgb_160 = cv2.resize(face_rgb_160, (160, 160), interpolation=cv2.INTER_AREA)

        # Preprocessing: convert to float tensor, (C, H, W), standardize [-1, 1]
        tensor = torch.from_numpy(face_rgb_160).permute(2, 0, 1).float()
        tensor = (tensor - 127.5) / 128.0
        tensor = tensor.unsqueeze(0).to(self.device)

        with torch.no_grad():
            raw_emb = self.model(tensor).cpu().numpy().flatten()

        # Enforce exact L2 normalization
        norm = np.linalg.norm(raw_emb)
        if norm > 0:
            embedding = raw_emb / norm
        else:
            embedding = raw_emb

        return embedding.astype(np.float32)

    def compute_centroid(self, embeddings_list: List[np.ndarray]) -> np.ndarray:
        """
        Calculates the centroid embedding across multiple captured poses (frontal, left, right).
        Normalizes the aggregated vector to unit length.
        """
        if not embeddings_list:
            raise ValueError("Cannot compute centroid from empty embeddings list.")

        arr = np.array(embeddings_list)
        sum_vec = np.sum(arr, axis=0)
        norm = np.linalg.norm(sum_vec)
        centroid = sum_vec / (norm if norm > 0 else 1.0)
        return centroid.astype(np.float32)

    def compute_similarity(self, emb1: np.ndarray, emb2: np.ndarray) -> float:
        """
        Computes cosine similarity between two L2-normalized vectors:
        Cosine Sim = (A . B) / (||A|| * ||B||) = A . B
        """
        dot = float(np.dot(emb1, emb2))
        return max(-1.0, min(1.0, dot))

    def find_best_match(
        self,
        query_embedding: np.ndarray,
        enrolled_employees: List[Dict[str, Any]],
        threshold: float = settings.COSINE_THRESHOLD,
    ) -> Tuple[Optional[Dict[str, Any]], float]:
        """
        Scans through all active enrolled employees to find the highest similarity match.
        Returns (matched_employee_dict, confidence_score). If highest similarity < threshold, returns (None, score).
        """
        if not enrolled_employees:
            return None, 0.0

        best_employee = None
        best_sim = -1.0

        for emp in enrolled_employees:
            emp_emb = emp.get("embedding")
            if emp_emb is None:
                continue

            sim = self.compute_similarity(query_embedding, emp_emb)
            if sim > best_sim:
                best_sim = sim
                best_employee = emp

        if best_sim >= threshold and best_employee is not None:
            return best_employee, best_sim
        else:
            return None, max(0.0, best_sim)


# Global singleton
face_recognizer = FaceRecognizer()
