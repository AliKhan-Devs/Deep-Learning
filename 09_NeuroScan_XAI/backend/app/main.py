import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.core.logging import logger
from app.core.database import init_db
from app.api.v1.routes_inference import router as inference_router
from app.api.v1.routes_history import router as history_router
from app.api.v1.routes_system import router as system_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing %s v%s...", settings.PROJECT_NAME, settings.VERSION)
    init_db()
    yield
    logger.info("Shutting down %s...", settings.PROJECT_NAME)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Explainable Deep Learning Framework for Brain MRI Tumor Diagnosis using DenseNet-121, Grad-CAM++, and Shannon Entropy Uncertainty.",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount sample images for frontend direct preview
if settings.SAMPLES_DIR.exists():
    app.mount("/assets/samples", StaticFiles(directory=str(settings.SAMPLES_DIR)), name="samples")

# Include Routers
app.include_router(inference_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")
app.include_router(system_router, prefix="/api/v1")

@app.get("/", tags=["Health"])
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "architecture": "DenseNet-121",
        "status": "HEALTHY",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
