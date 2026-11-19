from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .config import settings
from .core.database import init_db
from .core.logging import logger
from .api.v1.routes_employees import router as employees_router
from .api.v1.routes_attendance import router as attendance_router
from .api.v1.routes_recognition import router as recognition_router
from .api.v1.routes_system import router as system_router

app = FastAPI(
    title="VisionAttend AI - Biometric Facial Attendance API",
    description="Enterprise-grade facial recognition attendance and workforce analytics system powered by deep metric learning (FaceNet).",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Next.js frontend (localhost:3000) and kiosk displays
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Storage Directories (for employee avatars & capture snapshots)
settings.AVATAR_DIR.mkdir(parents=True, exist_ok=True)
settings.SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/avatars", StaticFiles(directory=str(settings.AVATAR_DIR)), name="avatars")
app.mount("/snapshots", StaticFiles(directory=str(settings.SNAPSHOT_DIR)), name="snapshots")

# Include API v1 Routers
app.include_router(recognition_router, prefix=settings.API_V1_STR)
app.include_router(employees_router, prefix=settings.API_V1_STR)
app.include_router(attendance_router, prefix=settings.API_V1_STR)
app.include_router(system_router, prefix=settings.API_V1_STR)


@app.on_event("startup")
def on_startup():
    logger.info("Initializing VisionAttend AI Database...")
    init_db()
    logger.info("VisionAttend AI Backend Engine is Ready.")


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} REST API",
        "documentation": "/docs",
        "status": "active",
    }
