from app.schemas.response import PatrolRecommendation


class PatrolOptimizer:
    def recommend(self) -> list[PatrolRecommendation]:
        hotspots = [
            {"cell": "h3-mg-road", "junction": "MG Road Metro", "risk": 92, "impact": 88, "violations": 42, "proximity": 82},
            {"cell": "h3-majestic", "junction": "Majestic Bus Stand", "risk": 87, "impact": 91, "violations": 38, "proximity": 76},
            {"cell": "h3-koramangala", "junction": "Sony World Junction", "risk": 83, "impact": 79, "violations": 34, "proximity": 68},
            {"cell": "h3-indiranagar", "junction": "Indiranagar 100 Feet Road", "risk": 78, "impact": 74, "violations": 28, "proximity": 72},
        ]
        recommendations: list[PatrolRecommendation] = []
        for index, item in enumerate(hotspots, start=1):
            priority = 0.5 * item["risk"] + 0.3 * item["impact"] + 0.2 * item["proximity"]
            recommendations.append(
                PatrolRecommendation(
                    officer_id=f"BTP-{100 + index}",
                    assigned_h3_cell=str(item["cell"]),
                    junction_name=str(item["junction"]),
                    priority_score=round(priority, 2),
                    risk_score=float(item["risk"]),
                    congestion_impact=float(item["impact"]),
                    expected_violations=int(item["violations"]),
                    expected_impact_reduction=round(priority * 0.42, 2),
                    status="recommended",
                )
            )
        return sorted(recommendations, key=lambda row: row.priority_score, reverse=True)
