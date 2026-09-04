from django.db import models
from django.conf import settings
from shifts.models import Shift
from professionals.models import ProfessionalProfile
from core.managers import LockedModelManager, TenantScopedManager

class ClockEvent(models.Model):
    """
    Temporal punch event capturing GPS coordinates and hardware/source attribution.
    """
    EVENT_TYPES = [
        ('in', 'Clock In'),
        ('out', 'Clock Out'),
        ('break_start', 'Break Start'),
        ('break_end', 'Break End'),
    ]

    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='clock_events')
    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='clock_events')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    timestamp = models.DateTimeField()
    gps_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    gps_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    source = models.CharField(max_length=20, default='app', choices=[('app', 'Mobile App GPS'), ('manual', 'Ward Lead Manual Override'), ('ocr', 'Paper Timesheet OCR')])
    is_geofence_verified = models.BooleanField(default=True)
    override_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['shift', 'event_type']),
        ]

    def __str__(self):
        return f"{self.professional.user.get_full_name()} [{self.event_type.upper()}] @ {self.timestamp.strftime('%H:%M')}"

class Timesheet(models.Model):
    """
    Aggregated hours record submitted post-shift.
    Protected at the QuerySet level against bulk mutation when approved.
    """
    APPROVAL_STATUSES = [
        ('draft', 'Draft / Pending Review'),
        ('submitted', 'Submitted by Professional'),
        ('approved', 'Approved & Locked'),
        ('rejected', 'Rejected by Ward Lead'),
        ('disputed', 'Disputed'),
    ]

    shift = models.OneToOneField(Shift, on_delete=models.CASCADE, related_name='timesheet')
    regular_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    break_unpaid_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.50)
    total_billable_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    approval_status = models.CharField(max_length=20, choices=APPROVAL_STATUSES, default='draft')
    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_timesheets'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    signature_image = models.ImageField(upload_to='timesheets/signatures/%Y/%m/', null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = LockedModelManager()

    def __str__(self):
        return f"Timesheet #{self.id} for Shift #{self.shift_id} ({self.total_billable_hours} hrs - {self.approval_status})"

class Incident(models.Model):
    """
    Clinical or workplace incident reported during a shift.
    """
    SEVERITY_LEVELS = [
        ('low', 'Low / Near Miss'),
        ('medium', 'Moderate / Requires Review'),
        ('high', 'Severe / Clinical Risk'),
        ('critical', 'Critical Sentinel Event'),
    ]

    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='incidents')
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reported_incidents')
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS, default='medium')
    title = models.CharField(max_length=200)
    narrative = models.TextField()
    is_resolved = models.BooleanField(default=False)
    resolved_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
