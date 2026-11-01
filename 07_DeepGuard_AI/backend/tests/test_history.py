import pytest
import uuid
import time
from app.services.history_service import history_service
from app.core.exceptions import AnalysisNotFoundError


def test_history_crud_lifecycle():
    """Validates full persistence lifecycle in SQLite database."""
    test_id = str(uuid.uuid4())
    sample_data = {
        "analysis_id": test_id,
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "media_type": "image",
        "original_filename": "test_person.jpg",
        "model_name": "efficientnet_b0",
        "status": "COMPLETED",
        "prediction": "Likely Authentic",
        "fake_probability": 0.05,
        "real_probability": 0.95,
        "decision_threshold": 0.50,
        "faces_detected_count": 1,
        "execution_duration_sec": 0.12,
        "faces": []
    }

    # 1. Save
    history_service.save_analysis(sample_data, file_path="/tmp/fake_test.jpg")

    # 2. Retrieve
    record = history_service.get_analysis(test_id)
    assert record["id"] == test_id
    assert record["prediction"] == "Likely Authentic"
    assert record["fake_probability"] == 0.05

    # 3. List
    items, total = history_service.list_history(page=1, limit=10)
    assert total >= 1
    ids = [i["id"] for i in items]
    assert test_id in ids

    # 4. Delete
    history_service.delete_analysis(test_id)

    # 5. Verify deleted
    with pytest.raises(AnalysisNotFoundError):
        history_service.get_analysis(test_id)
