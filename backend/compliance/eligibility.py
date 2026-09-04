from datetime import timedelta
from django.utils import timezone
from .models import ComplianceRule
from professionals.models import ProfessionalProfile, Credential
from shifts.models import Shift

class EligibilityService:
    """
    Single source of truth for shift candidate eligibility.
    Re-validated at:
    1. Offer dispatch time
    2. Candidate confirmation time
    3. Shift-start / Clock-in time
    """

    @classmethod
    def validate_shift_eligibility(cls, professional: ProfessionalProfile, shift: Shift) -> tuple[bool, str]:
        facility = shift.department.facility
        organization = facility.organization

        # 1. Check account active status
        if not professional.is_active:
            return False, "Candidate profile is currently inactive or suspended."

        # 2. Query configurable compliance rules for this facility / organization
        rules = ComplianceRule.objects.filter(
            organization=organization,
            is_active=True
        ).filter(
            models.Q(facility=facility) | models.Q(facility__isnull=True)
        )

        # Rest period rule
        rest_rule = rules.filter(rule_type='min_rest_period_hours').first()
        min_rest_hours = rest_rule.numeric_value if rest_rule else 11.0

        # Check adjacent shifts
        prior_shift = Shift.objects.filter(
            assigned_professional=professional,
            status__in=['confirmed', 'in_progress', 'completed'],
            end_time__lte=shift.start_time
        ).order_by('-end_time').first()

        if prior_shift:
            gap = (shift.start_time - prior_shift.end_time).total_seconds() / 3600.0
            if gap < min_rest_hours:
                return False, f"Rest Period Violation: Requires {min_rest_hours}h rest between shifts, but prior shift ends only {round(gap, 1)}h prior."

        # 3. Check mandatory clinical qualifications & unexpired credentials
        required_quals = shift.required_qualifications.all()
        today = timezone.now().date()

        for qual in required_quals:
            active_cred = professional.credentials.filter(
                qualification=qual,
                verification_status='verified'
            ).first()

            if not active_cred:
                return False, f"Missing required verified clinical qualification: {qual.name}."

            if active_cred.expiry_date and active_cred.expiry_date < today:
                return False, f"Expired credential: {qual.name} expired on {active_cred.expiry_date}."

        # 4. Check facility blacklist
        if professional.preferences.filter(blocked_facilities=facility).exists():
            return False, "Candidate has excluded this facility in their scheduling preferences."

        return True, "Eligible"
