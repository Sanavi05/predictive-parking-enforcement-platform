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
  latitude: number;
  longitude: number;
  risk_score: number;
};

export type PredictionRequest = {
  latitude: number;
  longitude: number;
  time: string;
};

export type PredictionResponse = {
  risk_score: number;
  predicted_violations: number;
  risk_level: string;
  congestion_impact: number;
  recommended_action: string;
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
};
