import math
from typing import Tuple
from core.models import Facility

class GeofenceValidationService:
    """
    Validates mobile GPS clock punches against the target facility's geofence boundary.
    """

    @staticmethod
    def calculate_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Haversine formula calculating distance in meters."""
        R = 6371000.0 # Earth radius in meters
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        return R * c

    @classmethod
    def validate_punch_location(cls, facility: Facility, user_lat: float, user_lon: float) -> Tuple[bool, float, str]:
        if not facility.latitude or not facility.longitude:
            # If facility coordinates are not yet calibrated, allow with warning
            return True, 0.0, "Facility geofence coordinates not configured; punch allowed."

        dist_meters = cls.calculate_distance_meters(
            float(user_lat), float(user_lon),
            float(facility.latitude), float(facility.longitude)
        )

        allowed_radius = facility.geofence_radius_meters or 250

        if dist_meters <= allowed_radius:
            return True, dist_meters, f"Punch location verified: {round(dist_meters)}m from facility center (within {allowed_radius}m tolerance)."
        else:
            return False, dist_meters, f"GPS Geofence Rejected: You are {round(dist_meters)}m away from {facility.name}. Maximum permitted radius is {allowed_radius}m."
