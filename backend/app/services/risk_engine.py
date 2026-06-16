def risk_level_from_score(score: float) -> str:
    if score >= 85:
        return "CRITICAL"
    if score >= 70:
        return "HIGH"
    if score >= 45:
        return "MODERATE"
    return "LOW"


def recommended_action(risk_level: str, predicted_violations: int) -> str:
    actions = {
        "CRITICAL": f"Deploy towing unit and 3 officers; expected violations: {predicted_violations}",
        "HIGH": f"Deploy 2 officers and mobile challan unit; expected violations: {predicted_violations}",
        "MODERATE": f"Schedule patrol pass and signage check; expected violations: {predicted_violations}",
        "LOW": f"Monitor through routine beat patrol; expected violations: {predicted_violations}",
    }
    return actions[risk_level]
