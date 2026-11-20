import torch
from app.models.densenet import NeuroScanDenseNet
from app.services.model_service import model_service
from app.config import settings

def test_densenet_architecture_forward():
    model = NeuroScanDenseNet(num_classes=4)
    model.eval()
    dummy_input = torch.randn(2, 3, 224, 224)
    with torch.no_grad():
        output = model(dummy_input)
    assert output.shape == (2, 4), f"Expected shape (2, 4), got {output.shape}"

def test_model_service_loaded_checkpoint():
    assert model_service.model is not None
    assert len(model_service.classes) == 4
    assert model_service.classes == ["glioma", "meningioma", "notumor", "pituitary"]

def test_forward_pass_probabilities_sum_to_one():
    dummy_input = torch.randn(1, 3, 224, 224).to(model_service.device)
    model_service.model.eval()
    with torch.no_grad():
        logits = model_service.model(dummy_input)
        probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
    assert abs(probs.sum() - 1.0) < 1e-4
    assert len(probs) == 4
