import io
import os
from typing import List, Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Path
from PIL import Image

from app.config import settings
from app.core.logging import logger
from app.models.schemas import DiagnosticResult, SampleScanInfo
from app.services.model_service import model_service
from app.services.history_service import history_service

router = APIRouter(prefix="/inference", tags=["Inference & XAI"])

SAMPLE_SCANS_META = [
    {
        "id": "glioma",
        "class_name": "glioma",
        "filename": "glioma_sample.jpg",
        "title": "High-Grade Glial Neoplasm",
        "clinical_notes": "Axial T1-CE brain MRI presenting heterogeneous infiltrative lesion with irregular necrotic core in the cerebral parenchyma.",
    },
    {
        "id": "meningioma",
        "class_name": "meningioma",
        "filename": "meningioma_sample.jpg",
        "title": "Extra-Axial Parasagittal Meningioma",
        "clinical_notes": "Well-circumscribed hyperdense dural-tail based mass with prominent mass effect on the adjacent cortex.",
    },
    {
        "id": "pituitary",
        "class_name": "pituitary",
        "filename": "pituitary_sample.jpg",
        "title": "Sellar Pituitary Macroadenoma",
        "clinical_notes": "Sellar expansion extending toward the suprasellar cistern and optic chiasmatic recess.",
    },
    {
        "id": "notumor",
        "class_name": "notumor",
        "filename": "notumor_sample.jpg",
        "title": "Normal Neuroanatomy (No Tumor)",
        "clinical_notes": "Symmetric ventricular contours, preserved gray-white matter junction, no pathological enhancements detected.",
    }
]

@router.post("/analyze", response_model=DiagnosticResult)
async def analyze_scan_upload(
    file: UploadFile = File(...),
    patient_id: Optional[str] = Form(None),
    notes: Optional[str] = Form(None)
):
    """
    Accepts an uploaded Brain MRI scan (JPEG, PNG), performs DenseNet-121 inference,
    computes Grad-CAM & Grad-CAM++ saliency heatmaps, and calculates Shannon Entropy uncertainty.
    """
    try:
        contents = await file.read()
        pil_image = Image.open(io.BytesIO(contents))
    except Exception as e:
        logger.error("Failed to read image upload: %s", e)
        raise HTTPException(status_code=400, detail="Invalid image file. Please upload a valid MRI scan.")

    result = model_service.analyze_scan(pil_image, scan_name=file.filename or "upload")
    history_service.save_analysis(result, patient_id=patient_id, notes=notes)
    return result

@router.get("/sample-scans", response_model=List[SampleScanInfo])
def list_sample_scans():
    """
    Returns the gallery of 4 bundled genuine clinical MRI scans for 1-click evaluation.
    """
    samples = []
    for s in SAMPLE_SCANS_META:
        samples.append(SampleScanInfo(
            id=s["id"],
            class_name=s["class_name"],
            filename=s["filename"],
            title=s["title"],
            clinical_notes=s["clinical_notes"],
            image_url=f"/assets/samples/{s['filename']}"
        ))
    return samples

@router.post("/analyze-sample/{sample_id}", response_model=DiagnosticResult)
def analyze_sample_scan(
    sample_id: str = Path(..., description="Sample ID: glioma, meningioma, pituitary, or notumor"),
    patient_id: Optional[str] = Form(None),
    notes: Optional[str] = Form(None)
):
    """
    Performs instant inference and XAI generation on one of the pre-loaded clinical sample scans.
    """
    target = next((s for s in SAMPLE_SCANS_META if s["id"] == sample_id), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"Sample '{sample_id}' not found.")

    sample_path = settings.SAMPLES_DIR / target["filename"]
    if not sample_path.exists():
        raise HTTPException(status_code=500, detail=f"Sample file {target['filename']} missing on server.")

    pil_image = Image.open(sample_path)
    result = model_service.analyze_scan(pil_image, scan_name=target["filename"])
    history_service.save_analysis(result, patient_id=patient_id or f"DEMO-{sample_id.upper()}", notes=notes)
    return result
