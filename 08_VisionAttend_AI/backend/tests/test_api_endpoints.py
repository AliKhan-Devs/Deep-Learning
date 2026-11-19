import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "VisionAttend AI" in data["service"]


def test_system_status():
    res = client.get("/api/v1/system/status")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert data["status"] == "OPERATIONAL"


def test_seed_demo_endpoint():
    res = client.post("/api/v1/system/seed-demo")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True


def test_list_and_create_employee():
    # Create employee via API
    payload = {
        "employee_code": "API-101",
        "full_name": "Clara Oswald",
        "email": "clara.oswald@visionattend.ai",
        "department": "Engineering",
        "role": "Systems Architect",
        "is_active": True,
    }
    create_res = client.post("/api/v1/employees", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["employee_code"] == "API-101"

    # List employees
    list_res = client.get("/api/v1/employees")
    assert list_res.status_code == 200
    employees = list_res.json()
    assert any(e["employee_code"] == "API-101" for e in employees)


def test_attendance_today_summary():
    res = client.get("/api/v1/attendance/today")
    assert res.status_code == 200
    data = res.json()
    assert "total_employees" in data
    assert "attendance_rate_pct" in data


def test_settings_get_and_update():
    get_res = client.get("/api/v1/settings")
    assert get_res.status_code == 200
    current_settings = get_res.json()
    assert "work_start_time" in current_settings

    # Update
    update_payload = {
        "work_start_time": "09:30:00",
        "late_grace_minutes": 20,
        "cosine_threshold": 0.68,
        "liveness_enabled": True,
        "liveness_threshold": 45.0,
    }
    put_res = client.put("/api/v1/settings", json=update_payload)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["work_start_time"] == "09:30:00"
    assert updated["cosine_threshold"] == 0.68
