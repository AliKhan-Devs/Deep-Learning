import os
import shutil
import base64
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.config import settings
from app.services.detector_service import detector_service
from app.services.video_service import video_detection_service

router = APIRouter()

class FrameRequest(BaseModel):
    frame_base64: str
    conf_threshold: Optional[float] = 0.45
    iou_threshold: Optional[float] = 0.50
    model_id: Optional[str] = "v3"

@router.post("/image")
async def detect_image_endpoint(
    file: Optional[UploadFile] = File(None),
    image_base64: Optional[str] = Form(None),
    conf_threshold: float = Form(0.45),
    iou_threshold: float = Form(0.50),
    model_id: str = Form("v3")
):
    try:
        if file is not None:
            image_bytes = await file.read()
        elif image_base64:
            # Strip data URI prefix if present
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]
            image_bytes = base64.b64decode(image_base64)
        else:
            raise HTTPException(status_code=400, detail="Must provide either an uploaded file or image_base64 string.")

        result = detector_service.detect_image(
            image_bytes=image_bytes,
            conf_threshold=conf_threshold,
            iou_threshold=iou_threshold,
            model_id=model_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection error: {str(e)}")

@router.post("/frame")
async def detect_frame_endpoint(req: FrameRequest):
    """Real-time webcam live-stream frame inference endpoint"""
    try:
        raw_b64 = req.frame_base64
        if "," in raw_b64:
            raw_b64 = raw_b64.split(",", 1)[1]
        image_bytes = base64.b64decode(raw_b64)

        result = detector_service.detect_image(
            image_bytes=image_bytes,
            conf_threshold=req.conf_threshold or 0.45,
            iou_threshold=req.iou_threshold or 0.50,
            model_id=req.model_id or "v3"
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Frame processing error: {str(e)}")

@router.post("/video")
async def detect_video_endpoint(
    file: UploadFile = File(...),
    conf_threshold: float = Form(0.45),
    sample_rate: int = Form(3),
    model_id: str = Form("v3")
):
    try:
        temp_input = os.path.join(settings.TEMP_DIR, f"input_{file.filename}")
        with open(temp_input, "wb") as f:
            shutil.copyfileobj(file.file, f)

        res = video_detection_service.process_video(
            video_path=temp_input,
            conf_threshold=conf_threshold,
            sample_rate=sample_rate,
            model_id=model_id
        )

        # Cleanup input file
        if os.path.exists(temp_input):
            try:
                os.remove(temp_input)
            except Exception:
                pass

        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video analysis error: {str(e)}")

@router.get("/samples")
def list_sample_images():
    samples_dir = os.path.join(settings.PROJECT_DIR, "backend", "samples")
    os.makedirs(samples_dir, exist_ok=True)
    
    samples = []
    # If samples exist in directory, list them
    if os.path.exists(samples_dir):
        for f in sorted(os.listdir(samples_dir)):
            if f.lower().endswith(('.jpg', '.jpeg', '.png')):
                samples.append({
                    "id": f,
                    "title": f.replace("_", " ").replace(".jpg", "").replace(".png", "").title(),
                    "filename": f,
                    "url": f"/api/v1/detect/samples/{f}"
                })
    return {"samples": samples}
