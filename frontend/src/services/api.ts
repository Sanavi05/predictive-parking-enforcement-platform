import axios from "axios";

import type {
  AnalyticsResponse,
  DashboardSummaryResponse,
  ExplanationResponse,
  Hotspot,
  PatrolRecommendation,
  PredictionRequest,
  PredictionResponse,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api",
});

export async function getAnalytics() {
  const { data } = await api.get<AnalyticsResponse>("/analytics");
  return data;
}

export async function getHotspots() {
  const { data } = await api.get<Hotspot[]>("/hotspots");
  return data;
}

export async function predictRisk(payload: PredictionRequest) {
  const { data } = await api.post<PredictionResponse>("/predict", payload);
  return data;
}

export async function predictLocation(payload: PredictionRequest) {
  return predictRisk(payload);
}

export async function getDashboardSummary() {
  const { data } = await api.get<DashboardSummaryResponse>("/dashboard-summary");
  return data;
}

export async function getPatrolRecommendations() {
  const { data } = await api.get<PatrolRecommendation[]>("/patrol/recommendations");
  return data;
}

export async function explainPrediction(payload: PredictionRequest) {
  const { data } = await api.post<ExplanationResponse>("/predict/explain", payload);
  return data;
}
