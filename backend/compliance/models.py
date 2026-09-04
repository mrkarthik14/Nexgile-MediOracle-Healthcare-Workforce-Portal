from django.db import models
from django.conf import settings
from core.models import Organization, Facility
from professionals.models import Credential, Qualification

class ComplianceRule(models.Model):
    """
    Jurisdiction, trust, and facility-specific compliance parameters.
    No hardcoded constants!
    """
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='compliance_rules')
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, null=True, blank=True, related_name='compliance_rules')
    role_scope = models.CharField(max_length=50, blank=True, help_text="e.g. registered_nurse, hca, or blank for all")
    name = models.CharField(max_length=150)
    rule_type = models.CharField(max_length=50, choices=[
        ('min_rest_period_hours', 'Minimum Rest Period (Hours)'),
        ('max_weekly_hours', 'Maximum Weekly Working Hours'),
        ('mandatory_qualification', 'Mandatory Clinical Qualification'),
        ('credential_grace_period_days', 'Credential Expiry Grace Period (Days)'),
    ])
    numeric_value = models.FloatField(null=True, blank=True, default=11.0, help_text="e.g. 11.0 for 11 hours rest, 48.0 for max weekly hours")
    mandatory_qualification = models.ForeignKey(Qualification, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        scope = self.facility.name if self.facility else self.organization.name
        return f"{self.name} [{scope}]: {self.rule_type} = {self.numeric_value}"

class Verification(models.Model):
    """
    Audit log of credential verification actions by a compliance officer.
    """
    credential = models.ForeignKey(Credential, on_delete=models.CASCADE, related_name='verifications')
    verifier = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='verification_actions')
    decision = models.CharField(max_length=30, choices=[('verified', 'Verified'), ('rejected', 'Rejected'), ('revoked', 'Revoked')])
    notes = models.TextField(blank=True)
    source_check_verified = models.BooleanField(default=True, help_text="Verified against primary source / professional register")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Verification #{self.id}: {self.credential} -> {self.decision} by {self.verifier}"
