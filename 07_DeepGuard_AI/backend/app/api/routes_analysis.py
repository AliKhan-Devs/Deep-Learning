import json
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException, Response, Query
from fastapi.responses import HTMLResponse, JSONResponse

from ..config import settings
from ..core.logging import logger
from ..core.exceptions import (
    FileValidationError,
    CheckpointMissingError,
    AnalysisNotFoundError,
    ModelNotFoundError
)
from ..models.schemas import (
    ImageAnalysisResponse,
    VideoAnalysisResponse,
    VideoFrameDetail,
    HistoryResponse,
    AnalysisSummaryItem
)
from ..services.image_infer import image_infer_service
from ..services.video_infer import video_infer_service
from ..services.history_service import history_service
from ..services.report_service import report_service

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("/image", response_model=ImageAnalysisResponse)
async def analyze_image_endpoint(
    file: UploadFile = File(..., description="Target image (JPG, PNG)"),
    model_name: str = Form(settings.DEFAULT_MODEL, description="Architecture: 'efficientnet_b0' or 'xception'")
):
    """
    Submits an image for face detection and deepfake forensic classification.
    """
    try:
        content = await file.read()
        return image_infer_service.analyze_image(
            file_bytes=content,
            original_filename=file.filename or "upload.jpg",
            model_name=model_name
        )
    except (FileValidationError, ModelNotFoundError, CheckpointMissingError):
        raise
    except Exception as e:
        logger.error(f"Image analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal analysis failure: {str(e)}")


@router.post("/video")
async def analyze_video_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="Target video (MP4, MOV, AVI)"),
    model_name: str = Form(settings.DEFAULT_MODEL, description="Architecture: 'efficientnet_b0' or 'xception'")
):
    """
    Uploads a video, validates constraints, and initiates asynchronous forensic frame extraction.
    Returns analysis_id immediately for polling.
    """
    try:
        content = await file.read()
        analysis_id = video_infer_service.start_video_analysis(
            file_bytes=content,
            original_filename=file.filename or "upload.mp4",
            model_name=model_name
        )

        analysis = history_service.get_analysis(analysis_id)
        saved_file_path = analysis["file_path"]

        # Enqueue background processing job
        background_tasks.add_task(
            video_infer_service.process_video_task,
            analysis_id=analysis_id,
            file_path=saved_file_path,
            model_name=model_name
        )

        return {
            "analysis_id": analysis_id,
            "status": "PENDING",
            "message": "Video accepted and queued for frame-level extraction and analysis.",
            "poll_url": f"{settings.API_V1_STR}/analysis/{analysis_id}"
        }
    except (FileValidationError, ModelNotFoundError, CheckpointMissingError):
        raise
    except Exception as e:
        logger.error(f"Video queuing error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to queue video analysis: {str(e)}")


@router.get("/{analysis_id}", response_model=VideoAnalysisResponse)
async def get_analysis_status_endpoint(analysis_id: str):
    """
    Polls processing status or retrieves completed report for an analysis ID.
    """
    try:
        record = history_service.get_analysis(analysis_id)
        frames = history_service.get_analysis_frames(analysis_id)

        timeline = [
            VideoFrameDetail(
                frame_index=f["frame_index"],
                timestamp_sec=f["timestamp_sec"],
                thumbnail_url=f"/static/thumbnails/{os.path.basename(f['thumbnail_path'])}" if f.get("thumbnail_path") else None,
                faces_count=f["faces_count"],
                fake_probability=f["fake_probability"],
                real_probability=f["real_probability"],
                is_suspicious=bool(f["is_suspicious"]),
                face_boxes=json.loads(f["face_boxes_json"]) if f.get("face_boxes_json") else []
            )
            for f in frames
        ]

        return VideoAnalysisResponse(
            analysis_id=record["id"],
            created_at=record["created_at"],
            media_type=record["media_type"],
            original_filename=record["original_filename"],
            model_name=record["model_name"],
            status=record["status"],
            progress_pct=record["progress_pct"],
            prediction=record.get("prediction"),
            fake_probability=record.get("fake_probability"),
            real_probability=record.get("real_probability"),
            frames_analyzed=record.get("frames_analyzed", 0),
            frames_with_faces=record.get("frames_with_faces", 0),
            suspicious_frames_count=record.get("suspicious_frames_count", 0),
            execution_duration_sec=record.get("execution_duration_sec", 0.0),
            timeline=timeline,
            error_message=record.get("error_message")
        )
    except AnalysisNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching analysis {analysis_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/list", response_model=HistoryResponse)
async def get_analysis_history_endpoint(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Fetches paginated analysis history and aggregate forensic dashboard statistics.
    """
    rows, total_count = history_service.list_history(page=page, limit=limit)
    stats = history_service.get_dashboard_stats()

    items = [
        AnalysisSummaryItem(
            id=r["id"],
            created_at=r["created_at"],
            media_type=r["media_type"],
            original_filename=r["original_filename"],
            model_name=r["model_name"],
            status=r["status"],
            prediction=r.get("prediction"),
            fake_probability=r.get("fake_probability"),
            real_probability=r.get("real_probability"),
            execution_duration_sec=r.get("execution_duration_sec", 0.0)
        )
        for r in rows
    ]

    return HistoryResponse(
        items=items,
        total_count=total_count,
        total_images=stats["total_images"],
        total_videos=stats["total_videos"],
        manipulated_count=stats["manipulated_count"],
        authentic_count=stats["authentic_count"],
    )


@router.delete("/{analysis_id}")
async def delete_analysis_endpoint(analysis_id: str):
    """
    Purges an analysis record, uploaded file, and extracted thumbnails.
    """
    try:
        history_service.delete_analysis(analysis_id)
        return {"status": "DELETED", "analysis_id": analysis_id}
    except AnalysisNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{analysis_id}/report")
async def download_report_endpoint(analysis_id: str, format: str = Query("html", pattern="^(html|json)$")):
    """
    Downloads official forensic analysis certificate/report in HTML or JSON format.
    """
    try:
        if format == "json":
            data = report_service.generate_json_report(analysis_id)
            return JSONResponse(
                content=data,
                headers={"Content-Disposition": f"attachment; filename=DeepGuard_Report_{analysis_id}.json"}
            )
        else:
            html_content = report_service.generate_html_report(analysis_id)
            return HTMLResponse(
                content=html_content,
                headers={"Content-Disposition": f"inline; filename=DeepGuard_Report_{analysis_id}.html"}
            )
    except AnalysisNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
