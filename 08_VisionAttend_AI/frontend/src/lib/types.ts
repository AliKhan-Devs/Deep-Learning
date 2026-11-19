export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  department: string;
  role: string;
  avatar_path?: string | null;
  has_enrolled_face: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: number;
  employee_id: number;
  employee_code: string;
  full_name: string;
  department: string;
  avatar_path?: string | null;
  date: string;
  check_in_time?: string | null;
  check_out_time?: string | null;
  status: "ON_TIME" | "LATE" | "HALF_DAY" | "PRESENT" | "DEPARTURE";
  confidence_score?: number | null;
  method: string;
  snapshot_path?: string | null;
}

export interface AttendanceSummary {
  date: string;
  total_employees: number;
  total_present: number;
  total_on_time: number;
  total_late: number;
  total_absent: number;
  attendance_rate_pct: number;
  recent_checkins: AttendanceRecord[];
}

export interface DepartmentStat {
  department: string;
  total_employees: number;
  present: number;
  absent: number;
  on_time: number;
  late: number;
  attendance_rate_pct: number;
}

export interface DetectedFaceVerdict {
  bbox: BoundingBox;
  recognized: boolean;
  employee_id?: number | null;
  employee_code?: string | null;
  full_name?: string | null;
  department?: string | null;
  avatar_url?: string | null;
  confidence: number;
  liveness_passed: boolean;
  liveness_score: number;
  attendance_status?: string | null;
  check_in_time?: string | null;
  message: string;
}

export interface VerifyFrameResponse {
  success: boolean;
  faces_detected_count: number;
  verdicts: DetectedFaceVerdict[];
  processing_time_ms: number;
  timestamp: string;
}

export interface SystemSettings {
  work_start_time: string;
  late_grace_minutes: number;
  cosine_threshold: number;
  liveness_enabled: boolean;
  liveness_threshold: number;
}

export interface SystemStatus {
  project_name: string;
  version: string;
  status: string;
  device: string;
  total_employees: number;
  enrolled_biometrics_count: number;
  today_present_count: number;
  attendance_rate_pct: number;
}
