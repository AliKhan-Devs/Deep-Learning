import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from .config import settings
from .core.logging import logger
from .core.database import init_db
from .core.exceptions import (
    DeepGuardBaseException,
    CheckpointMissingError,
    ModelNotFoundError,
    FileValidationError,
    AnalysisNotFoundError
)
from .api.routes_analysis import router as analysis_router
from .api.routes_models import router as models_router
from .api.routes_system import router as system_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        f"{settings.PROJECT_DESCRIPTION}\n\n"
        "Forensic Deepfake Detection Platform supporting image & video analysis, "
        "face detection, frame sampling, prediction aggregation, and verifiable reporting."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local Next.js on localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static file directories for video thumbnails and uploaded media
if settings.THUMBNAILS_DIR.exists():
    app.mount("/static/thumbnails", StaticFiles(directory=str(settings.THUMBNAILS_DIR)), name="thumbnails")

if settings.UPLOAD_DIR.exists():
    app.mount("/static/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")


@app.on_event("startup")
async def on_startup():
    """Initializes database schema and verifies storage directories."""
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    init_db()
    logger.info("DeepGuard AI Backend initialization complete.")


# Global Custom Exception Handlers
@app.exception_handler(CheckpointMissingError)
async def checkpoint_missing_handler(request: Request, exc: CheckpointMissingError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error_type": "CHECKPOINT_MISSING",
            "message": str(exc),
            "model_name": exc.model_name,
            "expected_path": exc.expected_path,
            "instructions": (
                "Please open the corresponding Google Colab training notebook, execute training on GPU, "
                "download 'best_model.pth', and place it in the specified artifacts folder."
            )
        }
    )


@app.exception_handler(FileValidationError)
async def file_validation_handler(request: Request, exc: FileValidationError):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error_type": "FILE_VALIDATION_ERROR", "message": str(exc)}
    )


@app.exception_handler(ModelNotFoundError)
async def model_not_found_handler(request: Request, exc: ModelNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"error_type": "MODEL_NOT_FOUND", "message": str(exc)}
    )


@app.exception_handler(AnalysisNotFoundError)
async def analysis_not_found_handler(request: Request, exc: AnalysisNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"error_type": "ANALYSIS_NOT_FOUND", "message": str(exc)}
    )


# Include API Routers
app.include_router(system_router, prefix=settings.API_V1_STR)
app.include_router(models_router, prefix=settings.API_V1_STR)
app.include_router(analysis_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """Root redirect / welcoming endpoint."""
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
        "models_url": f"{settings.API_V1_STR}/models",
        "history_url": f"{settings.API_V1_STR}/analysis/history/list"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
