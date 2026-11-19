import numpy as np
from app.services.face_recognizer import face_recognizer


def test_extract_embedding_shape_and_normalization():
    # Synthetic face crop (160, 160, 3)
    crop = (np.random.rand(160, 160, 3) * 255).astype(np.uint8)
    emb = face_recognizer.extract_embedding(crop)

    assert isinstance(emb, np.ndarray)
    assert emb.shape == (512,)
    # Verify L2 norm is approximately 1.0
    norm = np.linalg.norm(emb)
    assert np.isclose(norm, 1.0, atol=1e-3)


def test_compute_similarity_identical_vectors():
    vec = np.random.randn(512).astype(np.float32)
    vec = vec / np.linalg.norm(vec)

    sim = face_recognizer.compute_similarity(vec, vec)
    assert np.isclose(sim, 1.0, atol=1e-4)


def test_compute_similarity_orthogonal_vectors():
    vec1 = np.zeros(512, dtype=np.float32)
    vec1[0] = 1.0
    vec2 = np.zeros(512, dtype=np.float32)
    vec2[1] = 1.0

    sim = face_recognizer.compute_similarity(vec1, vec2)
    assert np.isclose(sim, 0.0, atol=1e-4)


def test_compute_centroid_multi_shot():
    v1 = np.random.randn(512).astype(np.float32)
    v1 = v1 / np.linalg.norm(v1)
    v2 = np.random.randn(512).astype(np.float32)
    v2 = v2 / np.linalg.norm(v2)

    centroid = face_recognizer.compute_centroid([v1, v2])
    assert centroid.shape == (512,)
    assert np.isclose(np.linalg.norm(centroid), 1.0, atol=1e-3)
