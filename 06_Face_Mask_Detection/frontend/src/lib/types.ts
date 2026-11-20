export interface DetectionBox {
  box: [number, number, number, number]; // [x1, y1, x2, y2]
  normalized_box: [number, number, number, number];
  class_id: number;
  class_name: "mask" | "no_mask";
  confidence: number;
  status?: "COMPLIANT" | "NON_COMPLIANT";
}

export interface ImageDetectionResult {
  model_used: string;
  model_name: string;
  image_dimensions: { width: number; height: number };
  total_faces: number;
  mask_count: number;
  no_mask_count: number;
  compliance_rate: number;
  status: "COMPLIANT" | "WARNING_NON_COMPLIANT";
  inference_time_ms: number;
  detections: DetectionBox[];
  annotated_image: string; // base64 data URI
}

export interface VideoTimelinePoint {
  frame_index: number;
  timestamp: number;
  total_faces: number;
  mask_count: number;
  no_mask_count: number;
  is_compliant: boolean;
}

export interface VideoViolationKeyframe {
  frame_index: number;
  timestamp: number;
  no_mask_count: number;
  thumbnail: string;
}

export interface VideoDetectionResult {
  duration_seconds: number;
  total_video_frames: number;
  processed_frames: number;
  fps: number;
  resolution: string;
  processing_time_sec: number;
  total_mask_detections: number;
  total_no_mask_detections: number;
  overall_compliance_rate: number;
  has_violations: boolean;
  timeline: VideoTimelinePoint[];
  violation_keyframes: VideoViolationKeyframe[];
  output_video_path?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  type: string;
  is_champion: boolean;
  mAP50: number;
  mAP50_95: number;
  precision: number;
  recall: number;
  description: string;
}

export interface SystemStatus {
  status: string;
  service: string;
  version: string;
  device: string;
  cuda_available: boolean;
  active_model_id: string;
  active_model_name: string;
  supported_classes: string[];
  thresholds: {
    default_confidence: number;
    default_iou: number;
  };
}

export interface SampleImage {
  id: string;
  title: string;
  filename: string;
  url: string;
}

export interface ExperimentMetricItem {
  id: string;
  title: string;
  model: string;
  architecture: string;
  epochs: number;
  batch_size: number;
  imgsz: number;
  parameters: string;
  weights_size_mb: number;
  best_epoch: number;
  metrics: {
    mAP50: number;
    mAP50_95: number;
    precision: number;
    recall: number;
    box_loss: number;
    cls_loss: number;
    dfl_loss?: number;
    l1_loss?: number;
  };
  strengths: string[];
  weaknesses: string[];
  verdict: string;
}
