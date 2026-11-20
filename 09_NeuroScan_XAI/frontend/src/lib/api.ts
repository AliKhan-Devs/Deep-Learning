import {
  DiagnosticResult,
  SampleScanInfo,
  AuditLogItem,
  SystemStatusResponse
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8002';

export async function getSystemStatus(): Promise<SystemStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/system/status`);
  if (!res.ok) throw new Error('Failed to fetch system status');
  return res.json();
}

export async function getSampleScans(): Promise<SampleScanInfo[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/inference/sample-scans`);
  if (!res.ok) throw new Error('Failed to fetch sample scans');
  return res.json();
}

export async function analyzeUploadedScan(
  file: File,
  patientId?: string,
  notes?: string
): Promise<DiagnosticResult> {
  const formData = new FormData();
  formData.append('file', file);
  if (patientId) formData.append('patient_id', patientId);
  if (notes) formData.append('notes', notes);

  const res = await fetch(`${API_BASE_URL}/api/v1/inference/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Inference analysis failed');
  }

  return res.json();
}

export async function analyzeSampleScan(
  sampleId: string,
  patientId?: string,
  notes?: string
): Promise<DiagnosticResult> {
  const formData = new FormData();
  if (patientId) formData.append('patient_id', patientId);
  if (notes) formData.append('notes', notes);

  const res = await fetch(`${API_BASE_URL}/api/v1/inference/analyze-sample/${sampleId}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Sample analysis failed');
  }

  return res.json();
}

export async function getAuditHistory(): Promise<AuditLogItem[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/history/list`);
  if (!res.ok) throw new Error('Failed to fetch audit history');
  return res.json();
}

export async function clearAuditHistory(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/history/clear`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to clear audit history');
}

export async function getClassesInfo(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE_URL}/api/v1/system/classes-info`);
  if (!res.ok) throw new Error('Failed to fetch classes info');
  return res.json();
}
