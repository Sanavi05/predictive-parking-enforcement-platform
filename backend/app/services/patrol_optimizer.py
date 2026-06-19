from __future__ import annotations

from pathlib import Path

import pandas as pd

from app.schemas.response import PatrolRecommendation, PatrolRouteStop


def _project_root() -> Path:
    for parent in Path(__file__).resolve().parents:
        if (parent / "datasets").exists():
            return parent
    return Path(__file__).resolve().parents[3]


DATASET_PATH = _project_root() / "datasets" / "parksight_processed.csv"


class PatrolOptimizer:
    def recommend(self) -> list[PatrolRecommendation]:
        frame = pd.read_csv(DATASET_PATH)

        grouped = (
            frame.groupby(["h3_cell", "junction_name"], dropna=False)
            .agg(
                violations=("id", "count"),
                congestion=("at_junction", "mean"),
                density=("h3_hour_density", "mean"),
                latitude=("latitude", "mean"),
                longitude=("longitude", "mean"),
            )
            .reset_index()
            .sort_values(["violations", "density"], ascending=False)
            .head(15)
        )

        max_violations = max(float(grouped["violations"].max()), 1.0)
        max_density = max(float(grouped["density"].max()), 1.0)

        zones = []

        for row in grouped.itertuples(index=False):
            risk = min(100.0, float(row.violations) / max_violations * 100.0)
            congestion_impact = min(100.0, float(row.density) / max_density * 100.0)
            priority = 0.6 * risk + 0.4 * congestion_impact

            zones.append({
                "h3_cell": str(row.h3_cell),
                "junction_name": str(row.junction_name or "Unknown"),
                "priority_score": round(priority, 2),
                "risk_score": round(risk, 2),
                "congestion_impact": round(congestion_impact, 2),
                "expected_violations": int(row.violations),
                "latitude": float(row.latitude),
                "longitude": float(row.longitude),
            })

        routes = self._build_greedy_routes(zones, officers=5, stops_per_route=3)

        recommendations: list[PatrolRecommendation] = []

        for index, route in enumerate(routes, start=1):
            if not route:
                continue

            first_stop = route[0]
            avg_priority = sum(stop["priority_score"] for stop in route) / len(route)
            total_violations = sum(stop["expected_violations"] for stop in route)
            avg_risk = sum(stop["risk_score"] for stop in route) / len(route)
            avg_congestion = sum(stop["congestion_impact"] for stop in route) / len(route)

            route_stops = [
                PatrolRouteStop(
                    sequence=stop_index,
                    h3_cell=stop["h3_cell"],
                    junction_name=stop["junction_name"],
                    priority_score=stop["priority_score"],
                    risk_score=stop["risk_score"],
                    congestion_impact=stop["congestion_impact"],
                    expected_violations=stop["expected_violations"],
                )
                for stop_index, stop in enumerate(route, start=1)
            ]

            route_names = " → ".join(stop["junction_name"] for stop in route)

            recommendations.append(
                PatrolRecommendation(
                    officer_id=f"BTP-{100 + index}",
                    assigned_h3_cell=first_stop["h3_cell"],
                    junction_name=first_stop["junction_name"],
                    priority_score=round(avg_priority, 2),
                    risk_score=round(avg_risk, 2),
                    congestion_impact=round(avg_congestion, 2),
                    expected_violations=int(total_violations),
                    expected_impact_reduction=round(avg_priority * 0.42, 2),
                    status="route_recommended",
                    route=route_stops,
                    route_summary=route_names,
                )
            )

        return sorted(recommendations, key=lambda item: item.priority_score, reverse=True)

    def _build_greedy_routes(
        self,
        zones: list[dict],
        officers: int,
        stops_per_route: int,
    ) -> list[list[dict]]:
        remaining = zones.copy()
        routes: list[list[dict]] = []

        for _ in range(officers):
            if not remaining:
                break

            route = []

            current = remaining.pop(0)
            route.append(current)

            while len(route) < stops_per_route and remaining:
                nearest_index = min(
                    range(len(remaining)),
                    key=lambda i: self._distance_score(current, remaining[i]),
                )
                current = remaining.pop(nearest_index)
                route.append(current)

            routes.append(route)

        return routes

    def _distance_score(self, a: dict, b: dict) -> float:
        lat_diff = a["latitude"] - b["latitude"]
        lon_diff = a["longitude"] - b["longitude"]
        distance = (lat_diff ** 2 + lon_diff ** 2) ** 0.5

        priority_bonus = b["priority_score"] / 1000

        return distance - priority_bonus