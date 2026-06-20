export type CountBucket = {
  label: string;
  count: number;
};

export type AnalyticsResponse = {
  total_violations: number;
  violations_by_hour: CountBucket[];
  violations_by_vehicle_type: CountBucket[];
  top_junctions: CountBucket[];
  top_police_stations: CountBucket[];
  peak_periods: string[];
};

export type Hotspot = {
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  risk?: "high" | "medium" | "low";
  risk_score?: number;
  predicted_violations?: number;
  congestion_score?: number;
  recommended_officers?: number;
  recommended_tow_trucks?: number;
  zone_name?: string;
};

export type PredictionRequest = {
  latitude: number;
  longitude: number;
  timestamp: string;
};

export type PredictionResponse = {
  predicted_violations: number;
  risk_score: number;
  risk_level: string;
  congestion_score: number;
  congestion_level: string;
  recommended_officers: number;
  recommended_tow_trucks: number;
  simulation_curve: number[];
};

export type DashboardSummaryResponse = {
  critical_zones: number;
  high_risk_zones: number;
  expected_violations_today: number;
  average_congestion_score: number;
};

export type PatrolRouteStop = {
  sequence: number;
  h3_cell: string;
  junction_name: string;
  priority_score: number;
  risk_score: number;
  congestion_impact: number;
  expected_violations: number;
};

export type PatrolRecommendation = {
  officer_id: string;
  assigned_h3_cell: string;
  junction_name: string;
  priority_score: number;
  risk_score: number;
  congestion_impact: number;
  expected_violations: number;
  expected_impact_reduction: number;
  status: string;
  route: PatrolRouteStop[];
  route_summary: string;
};

export type ExplanationDriver = {
  label: string;
  impact: number;
  direction: "increase" | "decrease" | "neutral";
  detail: string;
};

export type ExplanationResponse = {
  drivers: ExplanationDriver[];
  summary: string;
};