from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# ---------------------------------------------------------------------------
# Employee Schemas
# ---------------------------------------------------------------------------
class EmployeeBase(BaseModel):
    employee_code: str
    full_name: str
    email: str
    department: str
    role: str
    is_active: bool = True


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class EmployeeResponse(EmployeeBase):
    id: int
    avatar_path: Optional[str] = None
    has_enrolled_face: bool = False
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Attendance Record Schemas
# ---------------------------------------------------------------------------
class AttendanceRecordResponse(BaseModel):
    id: int
    employee_id: int
    employee_code: str
    full_name: str
    department: str
    avatar_path: Optional[str] = None
    date: str
    check_in_time: Optional[str] = None
    check_out_time: Optional[str] = None
    status: str  # ON_TIME, LATE, HALF_DAY, PRESENT
    confidence_score: Optional[float] = None
    method: str = "FACIAL_RECOGNITION"
    snapshot_path: Optional[str] = None


class AttendanceSummary(BaseModel):
    date: str
    total_employees: int
    total_present: int
    total_on_time: int
    total_late: int
    total_absent: int
    attendance_rate_pct: float
    recent_checkins: List[AttendanceRecordResponse] = []


class DepartmentStat(BaseModel):
    department: str
    total_employees: int
    present: int
    absent: int
    on_time: int
    late: int
    attendance_rate_pct: float


# ---------------------------------------------------------------------------
# Recognition & Verification Schemas
# ---------------------------------------------------------------------------
class BoundingBox(BaseModel):
    x: int
    y: int
    w: int
    h: int


class VerifyFrameRequest(BaseModel):
    image_base64: str  # Base64 encoded JPEG / PNG frame from webcam stream
    device_id: Optional[str] = "kiosk-front-desk-01"


class DetectedFaceVerdict(BaseModel):
    bbox: BoundingBox
    recognized: bool
    employee_id: Optional[int] = None
    employee_code: Optional[str] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    avatar_url: Optional[str] = None
    confidence: float
    liveness_passed: bool
    liveness_score: float
    attendance_status: Optional[str] = None  # ON_TIME, LATE, ALREADY_CHECKED_IN, DEPARTURE
    check_in_time: Optional[str] = None
    message: str


class VerifyFrameResponse(BaseModel):
    success: bool
    faces_detected_count: int
    verdicts: List[DetectedFaceVerdict]
    processing_time_ms: float
    timestamp: str


# ---------------------------------------------------------------------------
# Enrollment Schemas
# ---------------------------------------------------------------------------
class EnrollFaceMultiShotRequest(BaseModel):
    employee_id: int
    image_shots_base64: List[str]  # 1 to 5 shots from different angles


class EnrollFaceResponse(BaseModel):
    success: bool
    employee_id: int
    shots_processed: int
    message: str


# ---------------------------------------------------------------------------
# Settings Schemas
# ---------------------------------------------------------------------------
class SystemSettingsModel(BaseModel):
    work_start_time: str = "09:00:00"
    late_grace_minutes: int = 15
    cosine_threshold: float = 0.65
    liveness_enabled: bool = True
    liveness_threshold: float = 40.0
