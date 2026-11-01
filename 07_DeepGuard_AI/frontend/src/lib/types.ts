export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ExpandedBoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface FacePrediction {
  face_index: number;
  bbox: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  expanded_bbox: ExpandedBoundingBox;
  fake_probability: number;
  real_probability: number;
  predicted_label: "REAL" | "FAKE";
  confidence: number;
  model_score: number;
}

export interface ImageAnalysisResponse {
  analysis_id: string;
  created_at: string;
  media_type: "image";
  original_filename: string;
  model_name: string;
  status: "COMPLETED" | "FAILED";
  prediction: "Likely Manipulated" | "Likely Authentic" | "Inconclusive / insufficient analyzable content";
  fake_probability: number;
  real_probability: number;
  faces_detected_count: number;
  faces: FacePrediction[];
  execution_duration_sec: number;
  disclaimer: string;
}

export interface VideoFrameDetail {
  frame_index: number;
  timestamp_sec: number;
  thumbnail_url: string | null;
  faces_count: number;
  fake_probability: number;
  real_probability: number;
  is_suspicious: boolean;
  face_boxes: any[];
}

export interface VideoAnalysisResponse {
  analysis_id: string;
  created_at: string;
  media_type: "video";
  original_filename: string;
  model_name: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress_pct: number;
  prediction?: "Likely Manipulated" | "Likely Authentic" | "Inconclusive / insufficient analyzable content";
  fake_probability?: number;
  real_probability?: number;
  frames_analyzed: number;
  frames_with_faces: number;
  suspicious_frames_count: number;
  execution_duration_sec: number;
  timeline: VideoFrameDetail[];
  error_message?: string;
  disclaimer: string;
}

export interface ModelInfo {
  model_name: string;
  display_name: string;
  architecture: string;
  num_classes: number;
  classes: string[];
  input_size: [number, number];
  decision_threshold: number;
  checkpoint_exists: boolean;
  checkpoint_path: string;
  device: string;
  is_ready: boolean;
  colab_instructions: string;
}

export interface SystemStatus {
  status: string;
  version: string;
  device: string;
  cuda_available: boolean;
  cuda_device_name: string | null;
  total_analyses: number;
  models_ready: string[];
  models_missing: string[];
  storage_uploads_count: number;
}

export interface AnalysisSummaryItem {
  id: string;
  created_at: string;
  media_type: "image" | "video";
  original_filename: string;
  model_name: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  prediction?: string;
  fake_probability?: number;
  real_probability?: number;
  execution_duration_sec: number;
}

export interface HistoryResponse {
  items: AnalysisSummaryItem[];
  total_count: number;
  total_images: number;
  total_videos: number;
  manipulated_count: number;
  authentic_count: number;
}
