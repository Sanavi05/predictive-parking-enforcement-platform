from math import asin, cos, radians, sin, sqrt


def validate_latitude_longitude(latitude: float, longitude: float) -> None:
    if not -90 <= latitude <= 90:
        raise ValueError("latitude must be between -90 and 90")
    if not -180 <= longitude <= 180:
        raise ValueError("longitude must be between -180 and 180")


def distance_km(origin_lat: float, origin_lng: float, target_lat: float, target_lng: float) -> float:
    radius_km = 6371.0
    d_lat = radians(target_lat - origin_lat)
    d_lng = radians(target_lng - origin_lng)
    a = sin(d_lat / 2) ** 2 + cos(radians(origin_lat)) * cos(radians(target_lat)) * sin(d_lng / 2) ** 2
    return round(2 * radius_km * asin(sqrt(a)), 3)


def lat_lng_to_h3(latitude: float, longitude: float, resolution: int = 8) -> str:
    validate_latitude_longitude(latitude, longitude)
    lat_bucket = int(round((latitude + 90) * 1000))
    lng_bucket = int(round((longitude + 180) * 1000))
    return f"h3-{resolution}-{lat_bucket:x}-{lng_bucket:x}"


def nearby_hotspots(latitude: float, longitude: float, hotspots: list[dict], max_distance_km: float = 2.0) -> list[dict]:
    validate_latitude_longitude(latitude, longitude)
    enriched = []
    for hotspot in hotspots:
        distance = distance_km(latitude, longitude, float(hotspot["latitude"]), float(hotspot["longitude"]))
        if distance <= max_distance_km:
            enriched.append({**hotspot, "distance_km": distance})
    return sorted(enriched, key=lambda item: item["distance_km"])
