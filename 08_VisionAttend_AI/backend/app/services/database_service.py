import sqlite3
import json
import io
import csv
import numpy as np
from datetime import datetime, timedelta, date, time
from typing import List, Dict, Any, Optional, Tuple
from ..core.database import get_db
from ..config import settings
from ..core.logging import logger


class DatabaseService:
    """
    CRUD repository for VisionAttend AI SQLite database.
    """

    # -----------------------------------------------------------------------
    # Employee Management
    # -----------------------------------------------------------------------
    def create_employee(
        self,
        employee_code: str,
        full_name: str,
        email: str,
        department: str,
        role: str,
        is_active: bool = True,
    ) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO employees (employee_code, full_name, email, department, role, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                """,
                (employee_code, full_name, email, department, role, 1 if is_active else 0),
            )
            emp_id = cursor.lastrowid
            cursor.execute("SELECT * FROM employees WHERE id = ?", (emp_id,))
            row = cursor.fetchone()
            return self._format_employee_row(row)

    def get_employee_by_id(self, employee_id: int) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM employees WHERE id = ?", (employee_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return self._format_employee_row(row)

    def get_employee_by_code(self, employee_code: str) -> Optional[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM employees WHERE employee_code = ?", (employee_code,))
            row = cursor.fetchone()
            if not row:
                return None
            return self._format_employee_row(row)

    def list_employees(self, include_inactive: bool = False) -> List[Dict[str, Any]]:
        with get_db() as conn:
            cursor = conn.cursor()
            if include_inactive:
                cursor.execute("SELECT * FROM employees ORDER BY employee_code ASC")
            else:
                cursor.execute("SELECT * FROM employees WHERE is_active = 1 ORDER BY employee_code ASC")
            rows = cursor.fetchall()
            return [self._format_employee_row(r) for r in rows]

    def update_employee(self, employee_id: int, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        valid_fields = ["full_name", "email", "department", "role", "is_active"]
        set_clauses = []
        values = []
        for f in valid_fields:
            if f in updates and updates[f] is not None:
                set_clauses.append(f"{f} = ?")
                val = updates[f]
                if f == "is_active":
                    val = 1 if val else 0
                values.append(val)

        if not set_clauses:
            return self.get_employee_by_id(employee_id)

        set_clauses.append("updated_at = datetime('now')")
        values.append(employee_id)

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                f"UPDATE employees SET {', '.join(set_clauses)} WHERE id = ?",
                tuple(values),
            )
            cursor.execute("SELECT * FROM employees WHERE id = ?", (employee_id,))
            row = cursor.fetchone()
            return self._format_employee_row(row) if row else None

    def delete_employee(self, employee_id: int) -> bool:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM employees WHERE id = ?", (employee_id,))
            return cursor.rowcount > 0

    def update_employee_embedding(
        self, employee_id: int, embedding_np: np.ndarray, avatar_rel_path: Optional[str] = None
    ) -> bool:
        embedding_json = json.dumps(embedding_np.tolist())
        with get_db() as conn:
            cursor = conn.cursor()
            if avatar_rel_path:
                cursor.execute(
                    """
                    UPDATE employees 
                    SET embedding = ?, avatar_path = ?, updated_at = datetime('now')
                    WHERE id = ?
                    """,
                    (embedding_json, avatar_rel_path, employee_id),
                )
            else:
                cursor.execute(
                    """
                    UPDATE employees 
                    SET embedding = ?, updated_at = datetime('now')
                    WHERE id = ?
                    """,
                    (embedding_json, employee_id),
                )
            return cursor.rowcount > 0

    def get_all_enrolled_employees(self) -> List[Dict[str, Any]]:
        """Returns all active employees with their 512-d embeddings deserialized as np.ndarray."""
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, employee_code, full_name, department, role, avatar_path, embedding FROM employees WHERE is_active = 1 AND embedding IS NOT NULL"
            )
            rows = cursor.fetchall()
            enrolled = []
            for r in rows:
                try:
                    raw_emb = json.loads(r["embedding"])
                    emb_np = np.array(raw_emb, dtype=np.float32)
                    enrolled.append({
                        "id": r["id"],
                        "employee_code": r["employee_code"],
                        "full_name": r["full_name"],
                        "department": r["department"],
                        "role": r["role"],
                        "avatar_path": r["avatar_path"],
                        "embedding": emb_np,
                    })
                except Exception as e:
                    logger.warning(f"Error parsing embedding for employee {r['employee_code']}: {e}")
            return enrolled

    # -----------------------------------------------------------------------
    # Attendance Engine Operations
    # -----------------------------------------------------------------------
    def record_attendance(
        self,
        employee_id: int,
        confidence: float,
        method: str = "FACIAL_RECOGNITION",
        snapshot_rel_path: Optional[str] = None,
        custom_time: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        State machine for check-in / check-out:
        1. If no record exists today -> Logs CHECK-IN. Evaluates ON_TIME vs LATE.
        2. If record exists with check_in_time and no check_out_time:
           If at least 5 minutes elapsed -> Logs CHECK-OUT (Departure).
           If less than 5 minutes elapsed -> Debounced / already checked in.
        3. If already checked out -> Ignores duplicate scans.
        """
        now = custom_time or datetime.now()
        today_str = now.strftime("%Y-%m-%d")
        time_str = now.strftime("%H:%M:%S")

        # Fetch work start time setting
        work_start_str = self.get_setting("work_start_time", settings.WORK_START_TIME)
        grace_mins = int(self.get_setting("late_grace_minutes", str(settings.LATE_GRACE_MINUTES)))

        # Compute on-time vs late boundary
        start_parts = [int(p) for p in work_start_str.split(":")]
        grace_cutoff = (
            datetime.combine(now.date(), time(start_parts[0], start_parts[1], start_parts[2]))
            + timedelta(minutes=grace_mins)
        ).time()

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT * FROM attendance_records WHERE employee_id = ? AND date = ?",
                (employee_id, today_str),
            )
            existing = cursor.fetchone()

            if not existing:
                # FIRST SCAN: Check-In
                status = "ON_TIME" if now.time() <= grace_cutoff else "LATE"
                cursor.execute(
                    """
                    INSERT INTO attendance_records 
                    (employee_id, date, check_in_time, status, confidence_score, method, snapshot_path, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                    """,
                    (employee_id, today_str, time_str, status, confidence, method, snapshot_rel_path),
                )
                rec_id = cursor.lastrowid
                return {
                    "action": "CHECK_IN",
                    "status": status,
                    "check_in_time": time_str,
                    "check_out_time": None,
                    "record_id": rec_id,
                    "message": f"Welcome! Check-in recorded as {status.replace('_', ' ')} at {time_str}.",
                }
            else:
                # Existing check-in found
                rec_id = existing["id"]
                check_in_t = existing["check_in_time"]
                check_out_t = existing["check_out_time"]

                if check_out_t is not None:
                    return {
                        "action": "ALREADY_COMPLETED",
                        "status": existing["status"],
                        "check_in_time": check_in_t,
                        "check_out_time": check_out_t,
                        "record_id": rec_id,
                        "message": f"Daily shift already completed. Check-in: {check_in_t}, Check-out: {check_out_t}.",
                    }

                # Evaluate time elapsed since check-in
                try:
                    ci_dt = datetime.strptime(f"{today_str} {check_in_t}", "%Y-%m-%d %H:%M:%S")
                    elapsed_seconds = (now - ci_dt).total_seconds()
                except Exception:
                    elapsed_seconds = 300

                if elapsed_seconds < 120:  # 2-minute debounce window
                    return {
                        "action": "DEBOUNCED",
                        "status": existing["status"],
                        "check_in_time": check_in_t,
                        "check_out_time": None,
                        "record_id": rec_id,
                        "message": f"Already checked in today at {check_in_t} ({existing['status']}).",
                    }
                else:
                    # Log Check-out / Departure
                    cursor.execute(
                        """
                        UPDATE attendance_records
                        SET check_out_time = ?, updated_at = datetime('now')
                        WHERE id = ?
                        """,
                        (time_str, rec_id),
                    )
                    return {
                        "action": "CHECK_OUT",
                        "status": "DEPARTURE",
                        "check_in_time": check_in_t,
                        "check_out_time": time_str,
                        "record_id": rec_id,
                        "message": f"Good evening! Check-out recorded at {time_str}.",
                    }

    def get_today_records(self, date_str: Optional[str] = None) -> List[Dict[str, Any]]:
        target_date = date_str or datetime.now().strftime("%Y-%m-%d")
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT a.*, e.employee_code, e.full_name, e.department, e.avatar_path
                FROM attendance_records a
                JOIN employees e ON a.employee_id = e.id
                WHERE a.date = ?
                ORDER BY a.check_in_time DESC
                """,
                (target_date,),
            )
            rows = cursor.fetchall()
            return [self._format_attendance_row(r) for r in rows]

    def get_attendance_history(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        department: Optional[str] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        query = """
            SELECT a.*, e.employee_code, e.full_name, e.department, e.avatar_path
            FROM attendance_records a
            JOIN employees e ON a.employee_id = e.id
            WHERE 1=1
        """
        params: List[Any] = []

        if start_date:
            query += " AND a.date >= ?"
            params.append(start_date)
        if end_date:
            query += " AND a.date <= ?"
            params.append(end_date)
        if department:
            query += " AND e.department = ?"
            params.append(department)
        if status:
            query += " AND a.status = ?"
            params.append(status)
        if search:
            query += " AND (e.full_name LIKE ? OR e.employee_code LIKE ?)"
            params.extend([f"%{search}%", f"%{search}%"])

        query += " ORDER BY a.date DESC, a.check_in_time DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()
            return [self._format_attendance_row(r) for r in rows]

    def get_today_summary(self, date_str: Optional[str] = None) -> Dict[str, Any]:
        target_date = date_str or datetime.now().strftime("%Y-%m-%d")
        with get_db() as conn:
            cursor = conn.cursor()

            # Total active employees
            cursor.execute("SELECT COUNT(*) FROM employees WHERE is_active = 1")
            total_employees = cursor.fetchone()[0]

            # Present count
            cursor.execute("SELECT COUNT(*) FROM attendance_records WHERE date = ?", (target_date,))
            total_present = cursor.fetchone()[0]

            # On-time count
            cursor.execute(
                "SELECT COUNT(*) FROM attendance_records WHERE date = ? AND status = 'ON_TIME'",
                (target_date,),
            )
            total_on_time = cursor.fetchone()[0]

            # Late count
            cursor.execute(
                "SELECT COUNT(*) FROM attendance_records WHERE date = ? AND status = 'LATE'",
                (target_date,),
            )
            total_late = cursor.fetchone()[0]

            total_absent = max(0, total_employees - total_present)
            rate = round((total_present / max(1, total_employees)) * 100, 1)

            recent = self.get_today_records(target_date)[:5]

            return {
                "date": target_date,
                "total_employees": total_employees,
                "total_present": total_present,
                "total_on_time": total_on_time,
                "total_late": total_late,
                "total_absent": total_absent,
                "attendance_rate_pct": rate,
                "recent_checkins": recent,
            }

    def get_department_analytics(self, date_str: Optional[str] = None) -> List[Dict[str, Any]]:
        target_date = date_str or datetime.now().strftime("%Y-%m-%d")
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    e.department,
                    COUNT(DISTINCT e.id) as total_emp,
                    COUNT(DISTINCT a.employee_id) as present_emp,
                    SUM(CASE WHEN a.status = 'ON_TIME' THEN 1 ELSE 0 END) as on_time_emp,
                    SUM(CASE WHEN a.status = 'LATE' THEN 1 ELSE 0 END) as late_emp
                FROM employees e
                LEFT JOIN attendance_records a ON e.id = a.employee_id AND a.date = ?
                WHERE e.is_active = 1
                GROUP BY e.department
                ORDER BY e.department ASC
            """, (target_date,))
            rows = cursor.fetchall()
            stats = []
            for r in rows:
                tot = r["total_emp"]
                pres = r["present_emp"] or 0
                ont = r["on_time_emp"] or 0
                lt = r["late_emp"] or 0
                ab = max(0, tot - pres)
                rate = round((pres / max(1, tot)) * 100, 1)
                stats.append({
                    "department": r["department"],
                    "total_employees": tot,
                    "present": pres,
                    "absent": ab,
                    "on_time": ont,
                    "late": lt,
                    "attendance_rate_pct": rate,
                })
            return stats

    def export_csv(self, start_date: Optional[str] = None, end_date: Optional[str] = None) -> str:
        records = self.get_attendance_history(start_date=start_date, end_date=end_date, limit=10000)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Record ID",
            "Employee Code",
            "Full Name",
            "Department",
            "Date",
            "Check-In Time",
            "Check-Out Time",
            "Status",
            "Confidence Score",
            "Verification Method",
        ])
        for r in records:
            writer.writerow([
                r["id"],
                r["employee_code"],
                r["full_name"],
                r["department"],
                r["date"],
                r["check_in_time"] or "",
                r["check_out_time"] or "",
                r["status"],
                f"{(r['confidence_score'] or 0):.3f}",
                r["method"],
            ])
        return output.getvalue()

    # -----------------------------------------------------------------------
    # System Settings
    # -----------------------------------------------------------------------
    def get_setting(self, key: str, default: str = "") -> str:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM settings WHERE key = ?", (key,))
            row = cursor.fetchone()
            return row["value"] if row else default

    def set_setting(self, key: str, value: str):
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
                (key, str(value)),
            )

    # -----------------------------------------------------------------------
    # Row Formatters
    # -----------------------------------------------------------------------
    def _format_employee_row(self, r: sqlite3.Row) -> Dict[str, Any]:
        return {
            "id": r["id"],
            "employee_code": r["employee_code"],
            "full_name": r["full_name"],
            "email": r["email"],
            "department": r["department"],
            "role": r["role"],
            "avatar_path": r["avatar_path"],
            "has_enrolled_face": bool(r["embedding"]),
            "is_active": bool(r["is_active"]),
            "created_at": str(r["created_at"]),
            "updated_at": str(r["updated_at"]),
        }

    def _format_attendance_row(self, r: sqlite3.Row) -> Dict[str, Any]:
        return {
            "id": r["id"],
            "employee_id": r["employee_id"],
            "employee_code": r["employee_code"],
            "full_name": r["full_name"],
            "department": r["department"],
            "avatar_path": r.get("avatar_path") if hasattr(r, "get") else r["avatar_path"] if "avatar_path" in r.keys() else None,
            "date": r["date"],
            "check_in_time": r["check_in_time"],
            "check_out_time": r["check_out_time"],
            "status": r["status"],
            "confidence_score": r["confidence_score"],
            "method": r["method"],
            "snapshot_path": r["snapshot_path"],
        }


# Global singleton
db_service = DatabaseService()
