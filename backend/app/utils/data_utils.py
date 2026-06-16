from datetime import datetime


def parse_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def normalize_score(value: float, minimum: float = 0, maximum: float = 100) -> float:
    return max(minimum, min(maximum, value))
