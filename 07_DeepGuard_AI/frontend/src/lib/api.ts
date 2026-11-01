import {
  ImageAnalysisResponse,
  VideoAnalysisResponse,
  ModelInfo,
  SystemStatus,
  HistoryResponse
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      let errorData: any = {};
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText };
      }
      throw new ApiError(
        errorData.message || errorData.detail || "API request failed",
        res.status,
        errorData
      );
    }
    return (await res.json()) as T;
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || "Network request failed", 500);
  }
}

export const api = {
  getHealth: () => request<{ status: string; service: string }>("/health"),

  getSystemStatus: () => request<SystemStatus>("/system/status"),

  getModels: () => request<ModelInfo[]>("/models"),

  analyzeImage: async (file: File, modelName: string): Promise<ImageAnalysisResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model_name", modelName);

    return request<ImageAnalysisResponse>("/analysis/image", {
      method: "POST",
      body: formData,
    });
  },

  analyzeVideo: async (
    file: File,
    modelName: string
  ): Promise<{ analysis_id: string; status: string; poll_url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("model_name", modelName);

    return request<{ analysis_id: string; status: string; poll_url: string }>("/analysis/video", {
      method: "POST",
      body: formData,
    });
  },

  getAnalysisStatus: (analysisId: string): Promise<VideoAnalysisResponse> => {
    return request<VideoAnalysisResponse>(`/analysis/${analysisId}`);
  },

  getHistory: (page = 1, limit = 20): Promise<HistoryResponse> => {
    return request<HistoryResponse>(`/analysis/history/list?page=${page}&limit=${limit}`);
  },

  deleteAnalysis: (analysisId: string) => {
    return request<{ status: string }>(`/analysis/${analysisId}`, {
      method: "DELETE",
    });
  },

  getReportUrl: (analysisId: string, format: "html" | "json" = "html") => {
    return `${API_BASE}/analysis/${analysisId}/report?format=${format}`;
  },
};
