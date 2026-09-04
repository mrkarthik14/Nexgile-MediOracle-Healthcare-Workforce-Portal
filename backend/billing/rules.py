from decimal import Decimal
from typing import Dict, Any

class OvertimeBreakRuleEngine:
    """
    Facility-configurable engine for computing regular hours, overtime multipliers, and required breaks.
    """

    @classmethod
    def calculate_hours_and_wages(cls, raw_hours: float, base_rate: float, facility_rules: Dict[str, Any] = None) -> Dict[str, Any]:
        rules = facility_rules or {
            'daily_overtime_threshold': 8.0,
            'overtime_multiplier': 1.5,
            'mandatory_unpaid_break_minutes': 30,
        }

        threshold = float(rules.get('daily_overtime_threshold', 8.0))
        multiplier = float(rules.get('overtime_multiplier', 1.5))
        break_mins = float(rules.get('mandatory_unpaid_break_minutes', 30))

        net_hours = max(0.0, raw_hours - (break_mins / 60.0))

        if net_hours <= threshold:
            regular_hours = net_hours
            overtime_hours = 0.0
        else:
            regular_hours = threshold
            overtime_hours = net_hours - threshold

        regular_pay = regular_hours * base_rate
        overtime_pay = overtime_hours * (base_rate * multiplier)
        total_gross = regular_pay + overtime_pay

        return {
            'regular_hours': round(regular_hours, 2),
            'overtime_hours': round(overtime_hours, 2),
            'break_hours': round(break_mins / 60.0, 2),
            'total_billable_hours': round(net_hours, 2),
            'regular_wages': round(regular_pay, 2),
            'overtime_wages': round(overtime_pay, 2),
            'total_gross': round(total_gross, 2),
        }
