from django.db import models
from django.conf import settings
from .managers import TenantScopedManager

class Organization(models.Model):
    """
    Top-level multi-tenant container (e.g. NHS Trust, Healthcare System, or Agency Provider).
    """
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class Facility(models.Model):
    """
    Physical hospital or healthcare facility under an organization.
    """
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='facilities')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    address = models.TextField()
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    geofence_radius_meters = models.PositiveIntegerField(default=250, help_text="GPS clock-in radius tolerance in meters")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantScopedManager()

    class Meta:
        verbose_name_plural = "Facilities"
        indexes = [
            models.Index(fields=['organization', 'code']),
        ]

    def __str__(self):
        return f"{self.name} - {self.organization.name}"

class Site(models.Model):
    """
    Physical building or campus within a facility.
    """
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='sites')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantScopedManager()

    def __str__(self):
        return f"{self.name} ({self.facility.name})"

class Department(models.Model):
    """
    Hospital department or ward (e.g. Emergency, ICU, General Med, Pediatrics).
    """
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='departments')
    site = models.ForeignKey(Site, on_delete=models.SET_NULL, null=True, blank=True, related_name='departments')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50)
    acuity_level = models.CharField(
        max_length=20,
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical Intensive')],
        default='medium'
    )
    target_nurse_to_patient_ratio = models.CharField(max_length=20, default='1:4')
    required_staffing_baseline = models.PositiveIntegerField(default=5)
    risk_threshold_yellow = models.FloatField(default=0.85, help_text="Fill rate below this triggers Yellow warning")
    risk_threshold_red = models.FloatField(default=0.70, help_text="Fill rate below this triggers Red critical warning")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantScopedManager()

    class Meta:
        indexes = [
            models.Index(fields=['facility', 'code']),
        ]

    def __str__(self):
        return f"{self.name} [{self.facility.name}]"

class AuditEvent(models.Model):
    """
    Immutable append-only audit trail logging all state-changing operational and financial actions.
    """
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_events'
    )
    action = models.CharField(max_length=100, help_text="e.g. shift_posted, offer_sent, clock_in, timesheet_approved, payment_remitted")
    target_type = models.CharField(max_length=100, help_text="Model class name (e.g. Shift, Timesheet, Invoice)")
    target_id = models.CharField(max_length=100, help_text="Primary key identifier of mutated entity")
    before_state = models.JSONField(null=True, blank=True)
    after_state = models.JSONField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['target_type', 'target_id']),
            models.Index(fields=['action', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.timestamp.strftime('%Y-%m-%d %H:%M')} | {self.action} on {self.target_type}#{self.target_id} by {self.actor}"
