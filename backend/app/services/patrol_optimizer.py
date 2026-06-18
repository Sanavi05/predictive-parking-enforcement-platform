from __future__ import annotations

from pathlib import Path

import pandas as pd

from app.schemas.response import PatrolRecommendation


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
            )
            .reset_index()
            .sort_values(["violations", "density"], ascending=False)
            .head(10)
        )

        max_violations = max(float(grouped["violations"].max()), 1.0)
        max_density = max(float(grouped["density"].max()), 1.0)
        recommendations: list[PatrolRecommendation] = []

        for index, row in enumerate(grouped.itertuples(index=False), start=1):
            risk = min(100.0, float(row.violations) / max_violations * 100.0)
            congestion_impact = min(100.0, float(row.density) / max_density * 100.0)
            priority = 0.6 * risk + 0.4 * congestion_impact
            recommendations.append(
                PatrolRecommendation(
                    officer_id=f"BTP-{100 + index}",
                    assigned_h3_cell=str(row.h3_cell),
                    junction_name=str(row.junction_name or "Unknown"),
                    priority_score=round(priority, 2),
                    risk_score=round(risk, 2),
                    congestion_impact=round(congestion_impact, 2),
                    expected_violations=int(row.violations),
                    expected_impact_reduction=round(priority * 0.42, 2),
                    status="recommended",
                )
            )
        return sorted(recommendations, key=lambda item: item.priority_score, reverse=True)
