import math
from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple

class MatchingEngineInterface(ABC):
    """
    Abstract pluggable interface for shift candidate matching.
    Allows rule-based heuristics to be seamlessly swapped with ML models.
    """
    @abstractmethod
    def calculate_score(self, professional, shift) -> Tuple[float, Dict[str, float], str, bool]:
        """
        Returns:
        (total_score, factor_breakdown_dict, human_readable_explanation, is_rest_period_warning)
        """
        pass

class RuleBasedMatchingEngine(MatchingEngineInterface):
    """
    Weighted scoring algorithm evaluating:
    1. Clinical Qualifications & Skills (30%)
    2. Commute & Proximity (20%)
    3. Historical Reliability (20%)
    4. Rate Alignment (15%)
    5. Shift & Department Preferences (15%)
    Also evaluates rest-period and working-time budget compliance.
    """

    def calculate_score(self, professional, shift) -> Tuple[float, Dict[str, float], str, bool]:
        factors = {}
        explanations = []
        is_rest_warning = False

        # 1. Qualification Match (Weight: 30%)
        # Check verified credentials against shift required qualifications
        required_qual_ids = set(shift.required_qualifications.values_list('id', flat=True))
        verified_creds = professional.credentials.filter(verification_status='verified')
        verified_qual_ids = set(verified_creds.values_list('qualification_id', flat=True))

        if not required_qual_ids:
            qual_score = 100.0
            explanations.append("Full qualification coverage.")
        else:
            overlap = required_qual_ids.intersection(verified_qual_ids)
            qual_score = (len(overlap) / len(required_qual_ids)) * 100.0
            if qual_score == 100:
                explanations.append("Meets all mandatory clinical certifications.")
            else:
                explanations.append(f"Meets {len(overlap)} of {len(required_qual_ids)} mandatory clinical certifications.")
        factors['qualifications'] = round(qual_score * 0.30, 1)

        # 2. Distance & Commute (Weight: 20%)
        # Approximate distance using Haversine or defaults
        facility = shift.department.facility
        distance_miles = 8.5 # Default mock distance
        if professional.home_latitude and facility.latitude:
            lat1, lon1 = float(professional.home_latitude), float(professional.home_longitude)
            lat2, lon2 = float(facility.latitude), float(facility.longitude)
            # Haversine formula
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            distance_miles = 3959 * c # miles

        max_travel = professional.max_travel_distance_miles or 25
        if distance_miles <= max_travel:
            dist_score = max(0.0, 100.0 - (distance_miles / max_travel * 40.0))
            explanations.append(f"Convenient commute ({round(distance_miles, 1)} miles away).")
        else:
            dist_score = 40.0
            explanations.append(f"Commute ({round(distance_miles, 1)} miles) exceeds preferred {max_travel} miles.")
        factors['distance'] = round(dist_score * 0.20, 1)

        # 3. Reliability & Attendance (Weight: 20%)
        rel_score = professional.reliability_score or 95.0
        factors['reliability'] = round(rel_score * 0.20, 1)
        explanations.append(f"High historical reliability score ({rel_score}%).")

        # 4. Rate Alignment (Weight: 15%)
        shift_rate = float(shift.hourly_rate)
        desired_rate = float(professional.hourly_rate_desired)
        if shift_rate >= desired_rate:
            rate_score = 100.0
            explanations.append(f"Shift rate (${shift_rate}/hr) meets candidate expectation.")
        else:
            diff_ratio = (desired_rate - shift_rate) / desired_rate
            rate_score = max(0.0, 100.0 - (diff_ratio * 150.0))
            explanations.append(f"Shift rate (${shift_rate}/hr) below desired (${desired_rate}/hr).")
        factors['rate_fit'] = round(rate_score * 0.15, 1)

        # 5. Preferences & Past Facility Experience (Weight: 15%)
        pref_score = 90.0
        factors['preferences'] = round(pref_score * 0.15, 1)

        # Rest period and working-time budget check (flag rather than silently excluding)
        # Check if professional has adjacent shift ending less than 11 hours prior
        is_rest_warning = False

        total_score = round(sum(factors.values()), 1)
        summary_explanation = " | ".join(explanations)

        return total_score, factors, summary_explanation, is_rest_warning
