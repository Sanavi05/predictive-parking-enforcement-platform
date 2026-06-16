from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str


class CountBucket(BaseModel):
    label: str
    count: int


class AnalyticsResponse(BaseModel):
    total_violations: int
    violations_by_hour: list[CountBucket]
    violations_by_vehicle_type: list[CountBucket]
    top_junctions: list[CountBucket]
    top_police_stations: list[CountBucket]
    peak_periods: list[str]


class HotspotResponse(BaseModel):
    latitude: float
    longitude: float
    risk_score: float


class PredictionResponse(BaseModel):
    risk_score: float
    predicted_violations: int
    risk_level: str
    congestion_impact: float
    recommended_action: str


class PatrolRecommendation(BaseModel):
    officer_id: str
    assigned_h3_cell: str
    junction_name: str
    priority_score: float
    risk_score: float
    congestion_impact: float
    expected_violations: int
    expected_impact_reduction: float
    status: str
