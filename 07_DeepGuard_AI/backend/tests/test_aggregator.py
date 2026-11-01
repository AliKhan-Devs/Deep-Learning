import pytest
from app.services.aggregator import score_aggregator, VideoScoreAggregator


def test_aggregator_no_faces():
    """Video with no detectable faces must yield inconclusive verdict."""
    empty_frames = [
        {"frame_index": 0, "faces_count": 0, "fake_probability": 0.0},
        {"frame_index": 1, "faces_count": 0, "fake_probability": 0.0},
    ]
    res = score_aggregator.aggregate(empty_frames)
    assert res["prediction"] == "Inconclusive / insufficient analyzable content"
    assert res["frames_with_faces"] == 0


def test_aggregator_authentic_video():
    """Consistent low manipulation scores must yield Likely Authentic."""
    authentic_frames = [
        {"frame_index": i, "faces_count": 1, "fake_probability": 0.12, "real_probability": 0.88}
        for i in range(15)
    ]
    res = score_aggregator.aggregate(authentic_frames)
    assert res["prediction"] == "Likely Authentic"
    assert res["fake_probability"] <= 0.20
    assert res["suspicious_frames_count"] == 0


def test_aggregator_manipulated_video():
    """High manipulation scores must yield Likely Manipulated."""
    manipulated_frames = [
        {"frame_index": i, "faces_count": 1, "fake_probability": 0.92, "real_probability": 0.08}
        for i in range(15)
    ]
    res = score_aggregator.aggregate(manipulated_frames)
    assert res["prediction"] == "Likely Manipulated"
    assert res["fake_probability"] >= 0.80
    assert res["suspicious_frames_count"] == 15


def test_aggregator_intermittent_suspicious_burst():
    """
    If a video has a sustained burst of suspicious frames (>= 25% of frames >= 0.65),
    it must trigger Likely Manipulated even if the average is somewhat diluted.
    """
    frames = []
    # 70% authentic (0.20)
    for i in range(14):
        frames.append({"frame_index": i, "faces_count": 1, "fake_probability": 0.20, "real_probability": 0.80})
    # 30% deepfake burst (0.90) - exceeds 25% trigger ratio
    for i in range(14, 20):
        frames.append({"frame_index": i, "faces_count": 1, "fake_probability": 0.90, "real_probability": 0.10})

    agg = VideoScoreAggregator(decision_threshold=0.50, suspicious_ratio_trigger=0.25)
    res = agg.aggregate(frames)
    assert res["prediction"] == "Likely Manipulated"
    assert res["suspicious_frames_count"] == 6
