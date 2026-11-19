import time
import base64
import uuid
import cv2
import numpy as np
from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from typing import List

from ...models.schemas import (
    VerifyFrameRequest,
    VerifyFrameResponse,
    DetectedFaceVerdict,
    BoundingBox,
)
from ...services.database_service import db_service
from ...services.face_detector import face_detector
from ...services.face_recognizer import face_recognizer
from ...services.liveness_detector import liveness_detector
from ...config import settings
from ...core.logging import logger

router = APIRouter(prefix="/recognition", tags=["Recognition"])


def decode_base64_image(base64_str: str) -> np.ndarray:
    try:
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        img_bytes = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise ValueError("Failed to decode image.")
        return cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Corrupt base64 image data: {e}",
        )


@router.post("/verify-frame", response_model=VerifyFrameResponse)
def verify_frame(payload: VerifyFrameRequest):
    """
    Real-Time Attendance Verification Endpoint.
    1. Detects all faces in frame.
    2. Runs passive liveness check on each crop.
    3. Extracts InceptionResnetV1 (FaceNet) 512-d embeddings.
    4. Matches against enrolled employee vector gallery.
    5. Dispatches attendance state machine (On-Time / Late / Departure).
    """
    t_start = time.perf_counter()
    img_rgb = decode_base64_image(payload.image_base64)

    # Detect faces
    detections = face_detector.detect_and_crop(img_rgb)
    if not detections:
        elapsed_ms = (time.perf_counter() - t_start) * 1000.0
        return VerifyFrameResponse(
            success=True,
            faces_detected_count=0,
            verdicts=[],
            processing_time_ms=round(elapsed_ms, 1),
            timestamp=datetime.now().isoformat(),
        )

    # Fetch active enrolled employees
    enrolled = db_service.get_all_enrolled_employees()
    threshold = float(db_service.get_setting("cosine_threshold", str(settings.COSINE_THRESHOLD)))

    verdicts: List[DetectedFaceVerdict] = []

    for det in detections:
        box = det["bbox"]
        crop = det["crop_rgb"]
        bbox_model = BoundingBox(x=box["x"], y=box["y"], w=box["w"], h=box["h"])

        # 1. Passive Liveness Check
        liveness_res = liveness_detector.check_liveness(crop)
        if not liveness_res["is_live"]:
            verdicts.append(
                DetectedFaceVerdict(
                    bbox=bbox_model,
                    recognized=False,
                    confidence=0.0,
                    liveness_passed=False,
                    liveness_score=liveness_res["score"],
                    message="Liveness Check Failed: Potential 2D screen/print spoofing detected.",
                )
            )
            continue

        # 2. Extract Embedding
        query_emb = face_recognizer.extract_embedding(crop)

        # 3. Match against Enrolled Employees
        matched_emp, sim_score = face_recognizer.find_best_match(
            query_embedding=query_emb,
            enrolled_employees=enrolled,
            threshold=threshold,
        )

        if matched_emp is not None:
            # 4. Save audit snapshot
            snap_filename = f"snap_{matched_emp['employee_code']}_{uuid.uuid4().hex[:8]}.jpg"
            snap_path = settings.SNAPSHOT_DIR / snap_filename
            cv2.imwrite(str(snap_path), cv2.cvtColor(crop, cv2.COLOR_RGB2BGR))
            snap_rel_path = f"/snapshots/{snap_filename}"

            # 5. Record Attendance in State Machine
            att_result = db_service.record_attendance(
                employee_id=matched_emp["id"],
                confidence=round(sim_score, 3),
                method="FACIAL_RECOGNITION",
                snapshot_rel_path=snap_rel_path,
            )

            verdicts.append(
                DetectedFaceVerdict(
                    bbox=bbox_model,
                    recognized=True,
                    employee_id=matched_emp["id"],
                    employee_code=matched_emp["employee_code"],
                    full_name=matched_emp["full_name"],
                    department=matched_emp["department"],
                    avatar_url=matched_emp.get("avatar_path"),
                    confidence=round(sim_score * 100, 1),
                    liveness_passed=True,
                    liveness_score=liveness_res["score"],
                    attendance_status=att_result["status"],
                    check_in_time=att_result.get("check_in_time"),
                    message=att_result["message"],
                )
            )
        else:
            verdicts.append(
                DetectedFaceVerdict(
                    bbox=bbox_model,
                    recognized=False,
                    confidence=round(sim_score * 100, 1),
                    liveness_passed=True,
                    liveness_score=liveness_res["score"],
                    message="Unrecognized Person (Not Enrolled or Confidence Below Threshold)",
                )
            )

    elapsed_ms = (time.perf_counter() - t_start) * 1000.0

    return VerifyFrameResponse(
        success=True,
        faces_detected_count=len(detections),
        verdicts=verdicts,
        processing_time_ms=round(elapsed_ms, 1),
        timestamp=datetime.now().isoformat(),
    )
