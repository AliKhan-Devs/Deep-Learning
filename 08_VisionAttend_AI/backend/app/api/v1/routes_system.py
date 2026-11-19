import torch
from fastapi import APIRouter
from ...models.schemas import SystemSettingsModel
from ...services.database_service import db_service
from ...config import settings
from ...core.logging import logger

router = APIRouter(tags=["System"])


@router.get("/system/status")
def get_system_status():
    enrolled = db_service.get_all_enrolled_employees()
    all_employees = db_service.list_employees(include_inactive=True)
    summary = db_service.get_today_summary()

    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "total_employees": len(all_employees),
        "enrolled_biometrics_count": len(enrolled),
        "today_present_count": summary["total_present"],
        "attendance_rate_pct": summary["attendance_rate_pct"],
    }


@router.get("/settings", response_model=SystemSettingsModel)
def get_settings():
    return SystemSettingsModel(
        work_start_time=db_service.get_setting("work_start_time", settings.WORK_START_TIME),
        late_grace_minutes=int(db_service.get_setting("late_grace_minutes", str(settings.LATE_GRACE_MINUTES))),
        cosine_threshold=float(db_service.get_setting("cosine_threshold", str(settings.COSINE_THRESHOLD))),
        liveness_enabled=db_service.get_setting("liveness_enabled", "true").lower() == "true",
        liveness_threshold=float(db_service.get_setting("liveness_threshold", str(settings.LIVENESS_LAPLACIAN_THRESHOLD))),
    )


@router.put("/settings", response_model=SystemSettingsModel)
def update_settings(payload: SystemSettingsModel):
    db_service.set_setting("work_start_time", payload.work_start_time)
    db_service.set_setting("late_grace_minutes", str(payload.late_grace_minutes))
    db_service.set_setting("cosine_threshold", str(payload.cosine_threshold))
    db_service.set_setting("liveness_enabled", "true" if payload.liveness_enabled else "false")
    db_service.set_setting("liveness_threshold", str(payload.liveness_threshold))

    logger.info("Updated system settings.")
    return payload


@router.post("/system/seed-demo")
def seed_demo_data():
    """Seeds demo corporate workforce profiles and sample attendance logs for testing and portfolio showcase."""
    demo_employees = [
        ("EMP-1001", "Sarah Jenkins", "sarah.jenkins@visionattend.ai", "Engineering", "Senior ML Engineer"),
        ("EMP-1002", "Alex Mercer", "alex.mercer@visionattend.ai", "Product", "Lead Product Manager"),
        ("EMP-1003", "Elena Rostova", "elena.rostova@visionattend.ai", "Design", "Principal UI/UX Designer"),
        ("EMP-1004", "Marcus Vance", "marcus.vance@visionattend.ai", "Operations", "DevOps Architect"),
        ("EMP-1005", "Priya Sharma", "priya.sharma@visionattend.ai", "HR", "People Operations Lead"),
        ("EMP-1006", "David Chen", "david.chen@visionattend.ai", "Engineering", "Frontend Tech Lead"),
    ]

    created = 0
    for code, name, email, dept, role in demo_employees:
        existing = db_service.get_employee_by_code(code)
        if not existing:
            emp = db_service.create_employee(
                employee_code=code,
                full_name=name,
                email=email,
                department=dept,
                role=role,
            )
            created += 1

    return {
        "success": True,
        "seeded_count": created,
        "message": f"Successfully seeded {created} enterprise profiles.",
    }
