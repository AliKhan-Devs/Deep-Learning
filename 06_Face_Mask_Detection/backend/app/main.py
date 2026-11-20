import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.api.v1.routes_system import router as system_router
from app.api.v1.routes_detection import router as detection_router
from app.api.v1.routes_experiments import router as experiments_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-performance real-time face mask detection API powered by fine-tuned YOLO models."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(system_router, prefix=f"{settings.API_V1_STR}/system", tags=["System"])
app.include_router(detection_router, prefix=f"{settings.API_V1_STR}/detect", tags=["Detection"])
app.include_router(experiments_router, prefix=f"{settings.API_V1_STR}/experiments", tags=["Experiments"])

# Mount static folders for samples and experiment runs assets
samples_dir = os.path.join(settings.PROJECT_DIR, "backend", "samples")
os.makedirs(samples_dir, exist_ok=True)
app.mount("/api/v1/detect/samples", StaticFiles(directory=samples_dir), name="samples")

runs_dir = str(settings.RUNS_DIR)
if os.path.exists(runs_dir):
    app.mount("/assets/runs", StaticFiles(directory=runs_dir), name="runs_assets")

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "champion_model": "YOLOv26s (Experiment 3)",
        "classes": settings.CLASS_NAMES,
        "status": "ready"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
