import {
  Employee,
  AttendanceRecord,
  AttendanceSummary,
  DepartmentStat,
  VerifyFrameResponse,
  SystemSettings,
  SystemStatus,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      let errorData: any = {};
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText };
      }
      throw new ApiError(
        errorData.detail || errorData.message || "API request failed",
        res.status,
        errorData
      );
    }
    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || "Network request failed", 500);
  }
}

export const api = {
  // System
  getHealth: () => request<{ status: string; service: string }>("/health"),
  getSystemStatus: () => request<SystemStatus>("/system/status"),
  seedDemoData: () => request<{ success: boolean; seeded_count: number; message: string }>("/system/seed-demo", { method: "POST" }),
  getSettings: () => request<SystemSettings>("/settings"),
  updateSettings: (data: SystemSettings) =>
    request<SystemSettings>("/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  // Attendance
  getTodaySummary: (dateStr?: string) =>
    request<AttendanceSummary>(`/attendance/today${dateStr ? `?date_str=${dateStr}` : ""}`),
  getAttendanceHistory: (params: {
    startDate?: string;
    endDate?: string;
    department?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.startDate) query.append("start_date", params.startDate);
    if (params.endDate) query.append("end_date", params.endDate);
    if (params.department) query.append("department", params.department);
    if (params.status) query.append("status", params.status);
    if (params.search) query.append("search", params.search);
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.offset) query.append("offset", params.offset.toString());
    return request<AttendanceRecord[]>(`/attendance/history?${query.toString()}`);
  },
  getDepartmentAnalytics: (dateStr?: string) =>
    request<DepartmentStat[]>(`/attendance/analytics${dateStr ? `?date_str=${dateStr}` : ""}`),
  getExportCsvUrl: (startDate?: string, endDate?: string) => {
    const query = new URLSearchParams();
    if (startDate) query.append("start_date", startDate);
    if (endDate) query.append("end_date", endDate);
    return `${API_BASE}/attendance/export?${query.toString()}`;
  },

  // Employees
  getEmployees: (includeInactive = false) =>
    request<Employee[]>(`/employees?include_inactive=${includeInactive}`),
  getEmployee: (id: number) => request<Employee>(`/employees/${id}`),
  createEmployee: (data: {
    employee_code: string;
    full_name: string;
    email: string;
    department: string;
    role: string;
    is_active?: boolean;
  }) =>
    request<Employee>("/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  updateEmployee: (id: number, data: Partial<Employee>) =>
    request<Employee>(`/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  deleteEmployee: (id: number) =>
    request<void>(`/employees/${id}`, { method: "DELETE" }),
  enrollFace: (employeeId: number, imageShotsBase64: string[]) =>
    request<{ success: boolean; employee_id: number; shots_processed: number; message: string }>(
      `/employees/${employeeId}/enroll`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employeeId,
          image_shots_base64: imageShotsBase64,
        }),
      }
    ),

  // Live Verification
  verifyFrame: (imageBase64: string, deviceId = "kiosk-front-desk-01") =>
    request<VerifyFrameResponse>("/recognition/verify-frame", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_base64: imageBase64,
        device_id: deviceId,
      }),
    }),
};
