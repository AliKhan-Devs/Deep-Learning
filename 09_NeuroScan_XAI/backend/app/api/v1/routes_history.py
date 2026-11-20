from typing import List
from fastapi import APIRouter
from app.models.schemas import AuditLogItem
from app.services.history_service import history_service

router = APIRouter(prefix="/history", tags=["Audit History"])

@router.get("/list", response_model=List[AuditLogItem])
def get_audit_history(limit: int = 50):
    """
    Returns recent MRI diagnostic evaluations and radiologist audit logs.
    """
    return history_service.get_history(limit=limit)

@router.delete("/clear")
def clear_audit_history():
    """
    Clears all saved audit logs.
    """
    history_service.clear_history()
    return {"status": "success", "message": "Audit history cleared."}
