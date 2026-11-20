def test_root_health(client):
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert data["architecture"] == "DenseNet-121"

def test_system_status(client):
    res = client.get("/api/v1/system/status")
    assert res.status_code == 200
    data = res.json()
    assert data["num_classes"] == 4
    assert "best_validation_accuracy" in data
    assert data["status"] == "ACTIVE"

def test_list_sample_scans(client):
    res = client.get("/api/v1/inference/sample-scans")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 4
    ids = [s["id"] for s in data]
    assert "glioma" in ids
    assert "meningioma" in ids
    assert "notumor" in ids
    assert "pituitary" in ids

def test_analyze_sample_glioma(client):
    res = client.post("/api/v1/inference/analyze-sample/glioma")
    assert res.status_code == 200
    data = res.json()
    assert "scan_id" in data
    assert "predicted_class" in data
    assert "confidence" in data
    assert "entropy" in data
    assert "gradcam_jet_b64" in data
    assert "gradcam_pp_jet_b64" in data
    assert data["original_b64"].startswith("data:image/jpeg;base64,")

def test_audit_history(client):
    res = client.get("/api/v1/history/list")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
