from datetime import datetime
from fastapi import APIRouter, Response, Query
from typing import List, Optional

from ...models.schemas import (
    AttendanceRecordResponse,
    AttendanceSummary,
    DepartmentStat,
)
from ...services.database_service import db_service

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.get("/today", response_model=AttendanceSummary)
def get_today_summary(date_str: Optional[str] = None):
    """Fetches real-time attendance KPIs and latest check-in feed for today."""
    return db_service.get_today_summary(date_str)


@router.get("/history", response_model=List[AttendanceRecordResponse])
def get_attendance_history(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """Filterable and paginated historical attendance audit log."""
    return db_service.get_attendance_history(
        start_date=start_date,
        end_date=end_date,
        department=department,
        status=status,
        search=search,
        limit=limit,
        offset=offset,
    )


@router.get("/analytics", response_model=List[DepartmentStat])
def get_department_analytics(date_str: Optional[str] = None):
    """Department-level punctuality rates, present vs absent breakdown."""
    return db_service.get_department_analytics(date_str)


@router.get("/export")
def export_attendance_csv(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):
    """Exports attendance records to a CSV file for payroll processing."""
    csv_content = db_service.export_csv(start_date=start_date, end_date=end_date)
    filename = f"visionattend_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
