import numpy as np
from datetime import datetime
from app.services.database_service import db_service


def test_employee_crud():
    # 1. Create
    emp = db_service.create_employee(
        employee_code="TEST-001",
        full_name="Alice Smith",
        email="alice.test@visionattend.ai",
        department="Engineering",
        role="QA Engineer",
    )
    assert emp["employee_code"] == "TEST-001"
    assert emp["full_name"] == "Alice Smith"

    # 2. Get
    fetched = db_service.get_employee_by_id(emp["id"])
    assert fetched is not None
    assert fetched["email"] == "alice.test@visionattend.ai"

    # 3. Update
    updated = db_service.update_employee(emp["id"], {"role": "Lead QA Engineer"})
    assert updated["role"] == "Lead QA Engineer"

    # 4. Enroll embedding
    dummy_emb = np.random.randn(512).astype(np.float32)
    dummy_emb /= np.linalg.norm(dummy_emb)
    success = db_service.update_employee_embedding(emp["id"], dummy_emb, "/avatars/test.jpg")
    assert success is True

    # 5. Verify in enrolled list
    enrolled = db_service.get_all_enrolled_employees()
    codes = [e["employee_code"] for e in enrolled]
    assert "TEST-001" in codes


def test_attendance_state_machine():
    emp = db_service.create_employee(
        employee_code="TEST-002",
        full_name="Bob Jones",
        email="bob.test@visionattend.ai",
        department="Product",
        role="Product Manager",
    )

    # 1. First scan: check-in (simulating 08:45 AM - ON_TIME)
    t1 = datetime.strptime("2026-11-19 08:45:00", "%Y-%m-%d %H:%M:%S")
    res1 = db_service.record_attendance(
        employee_id=emp["id"],
        confidence=0.92,
        custom_time=t1,
    )
    assert res1["action"] == "CHECK_IN"
    assert res1["status"] == "ON_TIME"
    assert res1["check_in_time"] == "08:45:00"

    # 2. Immediate duplicate scan within 2 minutes: debounced
    t2 = datetime.strptime("2026-11-19 08:46:00", "%Y-%m-%d %H:%M:%S")
    res2 = db_service.record_attendance(
        employee_id=emp["id"],
        confidence=0.91,
        custom_time=t2,
    )
    assert res2["action"] == "DEBOUNCED"

    # 3. Evening scan: check-out (simulating 17:30 PM - CHECK_OUT)
    t3 = datetime.strptime("2026-11-19 17:30:00", "%Y-%m-%d %H:%M:%S")
    res3 = db_service.record_attendance(
        employee_id=emp["id"],
        confidence=0.89,
        custom_time=t3,
    )
    assert res3["action"] == "CHECK_OUT"
    assert res3["check_out_time"] == "17:30:00"


def test_attendance_summary_and_export():
    summary = db_service.get_today_summary("2026-11-19")
    assert "total_employees" in summary
    assert "attendance_rate_pct" in summary

    csv_data = db_service.export_csv(start_date="2026-11-19", end_date="2026-11-19")
    assert "Record ID" in csv_data
    assert "Employee Code" in csv_data
