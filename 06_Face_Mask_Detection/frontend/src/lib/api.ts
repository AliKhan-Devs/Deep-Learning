import {
  ImageDetectionResult,
  VideoDetectionResult,
  SystemStatus,
  ModelInfo,
  SampleImage,
  ExperimentMetricItem,
  MultiModelComparisonResult,
} from "./types";

const BACKEND_BASE = "http://127.0.0.1:8003/api/v1";

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch(`${BACKEND_BASE}/system/status`);
  if (!res.ok) throw new Error("Failed to fetch system status");
  return res.json();
}

export async function fetchModels(): Promise<{ models: ModelInfo[]; recommended_model: string }> {
  const res = await fetch(`${BACKEND_BASE}/system/models`);
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
}

export async function fetchExperiments(): Promise<{
  champion_id: string;
  summary: string;
  experiments: ExperimentMetricItem[];
}> {
  const res = await fetch(`${BACKEND_BASE}/experiments/comparison`);
  if (!res.ok) throw new Error("Failed to fetch experiments");
  return res.json();
}

export async function fetchSamples(): Promise<{ samples: SampleImage[] }> {
  const res = await fetch(`${BACKEND_BASE}/detect/samples`);
  if (!res.ok) throw new Error("Failed to fetch sample images");
  return res.json();
}

export async function detectImageUpload(
  file?: File,
  imageBase64?: string,
  confThreshold: number = 0.45,
  iouThreshold: number = 0.50,
  modelId: string = "v3"
): Promise<ImageDetectionResult> {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }
  if (imageBase64) {
    formData.append("image_base64", imageBase64);
  }
  formData.append("conf_threshold", confThreshold.toString());
  formData.append("iou_threshold", iouThreshold.toString());
  formData.append("model_id", modelId);

  const res = await fetch(`${BACKEND_BASE}/detect/image`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Image detection failed" }));
    throw new Error(err.detail || "Image detection failed");
  }
  return res.json();
}

export async function detectWebcamFrame(
  frameBase64: string,
  confThreshold: number = 0.45,
  modelId: string = "v3"
): Promise<ImageDetectionResult> {
  const res = await fetch(`${BACKEND_BASE}/detect/frame`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      frame_base64: frameBase64,
      conf_threshold: confThreshold,
      model_id: modelId,
    }),
  });

  if (!res.ok) {
    throw new Error("Webcam frame inference failed");
  }
  return res.json();
}

export async function detectVideoUpload(
  file: File,
  confThreshold: number = 0.45,
  sampleRate: number = 3,
  modelId: string = "v3"
): Promise<VideoDetectionResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("conf_threshold", confThreshold.toString());
  formData.append("sample_rate", sampleRate.toString());
  formData.append("model_id", modelId);

  const res = await fetch(`${BACKEND_BASE}/detect/video`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Video detection failed" }));
    throw new Error(err.detail || "Video detection failed");
  }
  return res.json();
}

export async function compareAllModels(
  file?: File,
  imageBase64?: string,
  confThreshold: number = 0.45,
  iouThreshold: number = 0.50
): Promise<MultiModelComparisonResult> {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }
  if (imageBase64) {
    formData.append("image_base64", imageBase64);
  }
  formData.append("conf_threshold", confThreshold.toString());
  formData.append("iou_threshold", iouThreshold.toString());

  const res = await fetch(`${BACKEND_BASE}/detect/compare-all`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Multi-model comparison failed" }));
    throw new Error(err.detail || "Multi-model comparison failed");
  }
  return res.json();
}

export async function compareWebcamFrame(
  frameBase64: string,
  confThreshold: number = 0.45,
  iouThreshold: number = 0.50
): Promise<MultiModelComparisonResult> {
  const res = await fetch(`${BACKEND_BASE}/detect/compare-frame`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      frame_base64: frameBase64,
      conf_threshold: confThreshold,
      iou_threshold: iouThreshold,
    }),
  });

  if (!res.ok) {
    throw new Error("Webcam comparison inference failed");
  }
  return res.json();
}
