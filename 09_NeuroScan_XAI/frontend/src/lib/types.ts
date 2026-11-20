export interface ProbabilityItem {
  class_name: string;
  probability: number;
  percentage: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
  confidence_score: number;
}

export interface DiagnosticResult {
  scan_id: string;
  predicted_class: 'glioma' | 'meningioma' | 'notumor' | 'pituitary' | string;
  confidence: number;
  entropy: number;
  risk_level: 'CONFIDENT' | 'REVIEW_RECOMMENDED' | 'HIGH_UNCERTAINTY' | string;
  risk_description: string;
  has_tumor: boolean;
  probabilities: ProbabilityItem[];
  original_b64: string;
  gradcam_jet_b64: string;
  gradcam_pp_jet_b64: string;
  gradcam_turbo_b64: string;
  gradcam_viridis_b64: string;
  contours_overlay_b64: string;
  bounding_boxes: BoundingBox[];
  inference_time_ms: number;
}

export interface SampleScanInfo {
  id: string;
  class_name: string;
  filename: string;
  title: string;
  clinical_notes: string;
  image_url: string;
}

export interface AuditLogItem {
  id: number;
  scan_id: string;
  patient_id?: string;
  predicted_class: string;
  confidence: number;
  entropy: number;
  risk_level: string;
  probabilities: Record<string, number>;
  notes?: string;
  created_at: string;
}

export interface SystemStatusResponse {
  project: string;
  version: string;
  architecture: string;
  device: string;
  num_classes: number;
  classes: string[];
  best_validation_accuracy: number;
  test_accuracy_pct: string;
  status: string;
}

export type XAIMode = 'gradcam' | 'gradcam_pp' | 'contours' | 'side_by_side';
export type ColorMap = 'jet' | 'turbo' | 'viridis';
