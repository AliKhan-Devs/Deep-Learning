import base64
import uuid
import cv2
import numpy as np
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from typing import List

from ...models.schemas import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EnrollFaceMultiShotRequest,
    EnrollFaceResponse,
)
from ...services.database_service import db_service
from ...services.face_detector import face_detector
from ...services.face_recognizer import face_recognizer
from ...config import settings
from ...core.logging import logger

router = APIRouter(prefix="/employees", tags=["Employees"])


def decode_base64_image(base64_str: str) -> np.ndarray:
    """Decodes a base64 encoded image string to an RGB numpy array."""
    try:
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        img_bytes = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise ValueError("Failed to decode image buffer.")
        img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
        return img_rgb
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid base64 image data: {e}",
        )


@router.get("", response_model=List[EmployeeResponse])
def get_employees(include_inactive: bool = False):
    return db_service.list_employees(include_inactive=include_inactive)


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate):
    existing = db_service.get_employee_by_code(payload.employee_code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee code {payload.employee_code} already exists.",
        )
    return db_service.create_employee(
        employee_code=payload.employee_code,
        full_name=payload.full_name,
        email=payload.email,
        department=payload.department,
        role=payload.role,
        is_active=payload.is_active,
    )


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int):
    emp = db_service.get_employee_by_id(employee_id)
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    return emp


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: int, payload: EmployeeUpdate):
    emp = db_service.get_employee_by_id(employee_id)
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    return db_service.update_employee(employee_id, payload.model_dump(exclude_unset=True))


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int):
    success = db_service.delete_employee(employee_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")
    return None


@router.post("/{employee_id}/enroll", response_model=EnrollFaceResponse)
def enroll_employee_face(employee_id: int, payload: EnrollFaceMultiShotRequest):
    """
    Enrolls an employee using 1 to 5 multi-shot facial images.
    Extracts face crops, computes InceptionResnetV1 embeddings, calculates normalized centroid,
    saves the primary frontal avatar crop, and stores vector in SQLite.
    """
    emp = db_service.get_employee_by_id(employee_id)
    if not emp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")

    if not payload.image_shots_base64:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one facial image shot is required for enrollment.",
        )

    embeddings = []
    saved_avatar_rel_path = None

    for idx, b64 in enumerate(payload.image_shots_base64):
        img_rgb = decode_base64_image(b64)
        faces = face_detector.detect_and_crop(img_rgb)
        if not faces:
            logger.warning(f"No face detected in enrollment shot #{idx + 1}")
            continue

        primary_face = faces[0]["crop_rgb"]
        emb = face_recognizer.extract_embedding(primary_face)
        embeddings.append(emb)

        # Save first valid shot as reference avatar
        if saved_avatar_rel_path is None:
            avatar_filename = f"avatar_{emp['employee_code']}_{uuid.uuid4().hex[:8]}.jpg"
            avatar_full_path = settings.AVATAR_DIR / avatar_filename
            # Save BGR for OpenCV
            avatar_bgr = cv2.cvtColor(primary_face, cv2.COLOR_RGB2BGR)
            cv2.imwrite(str(avatar_full_path), avatar_bgr)
            saved_avatar_rel_path = f"/avatars/{avatar_filename}"

    if not embeddings:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not detect a clear human face in any of the provided enrollment shots. Please ensure good lighting and face camera directly.",
        )

    # Compute L2-normalized multi-pose centroid
    centroid_emb = face_recognizer.compute_centroid(embeddings)
    db_service.update_employee_embedding(
        employee_id=employee_id,
        embedding_np=centroid_emb,
        avatar_rel_path=saved_avatar_rel_path,
    )

    logger.info(
        f"Enrolled employee {emp['employee_code']} ({emp['full_name']}) with {len(embeddings)} shots centroid."
    )

    return EnrollFaceResponse(
        success=True,
        employee_id=employee_id,
        shots_processed=len(embeddings),
        message=f"Biometric enrollment completed successfully using {len(embeddings)} facial angles.",
    )
