from django.db import models
from django.conf import settings
from core.models import Department, Facility, AuditEvent
from professionals.models import Qualification, ProfessionalProfile
from core.managers import TenantScopedManager

class Shift(models.Model):
    """
    Core shift unit requested by a hospital department.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('posted', 'Posted / Open'),
        ('offered', 'Offered to Candidate(s)'),
        ('confirmed', 'Confirmed / Booked'),
        ('in_progress', 'In Progress (Active)'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('disputed', 'Disputed'),
    ]

    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='shifts')
    role_required = models.CharField(max_length=50, default='registered_nurse')
    specialty = models.CharField(max_length=100, default='General Med-Surg')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    break_duration_minutes = models.PositiveIntegerField(default=30)
    acuity_level = models.CharField(max_length=20, default='medium')
    nurse_to_patient_ratio = models.CharField(max_length=20, default='1:4')
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=52.00)
    bonus_incentive = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    required_qualifications = models.ManyToManyField(Qualification, blank=True, related_name='required_for_shifts')
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='draft')
    assigned_professional = models.ForeignKey(
        ProfessionalProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_shifts'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_shifts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = TenantScopedManager()

    class Meta:
        indexes = [
            models.Index(fields=['department', 'status']),
            models.Index(fields=['start_time', 'end_time']),
        ]

    def __str__(self):
        return f"{self.specialty} @ {self.department.name} ({self.start_time.strftime('%b %d %H:%M')} - {self.get_status_display()})"

class ShiftTemplate(models.Model):
    """
    Reusable template for ward shift patterns (e.g. Day 07:00-19:30, Night 19:00-07:30).
    """
    facility = models.ForeignKey(Facility, on_delete=models.CASCADE, related_name='shift_templates')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='shift_templates')
    name = models.CharField(max_length=150)
    role_required = models.CharField(max_length=50)
    specialty = models.CharField(max_length=100)
    start_time_of_day = models.TimeField()
    duration_hours = models.DecimalField(max_digits=4, decimal_places=2, default=12.0)
    base_rate = models.DecimalField(max_digits=8, decimal_places=2)

    objects = TenantScopedManager()

    def __str__(self):
        return f"{self.name} ({self.department.name})"

class Recurrence(models.Model):
    """
    RRULE-compliant recurring schedule for bulk shift generation.
    """
    template = models.ForeignKey(ShiftTemplate, on_delete=models.CASCADE, related_name='recurrences')
    rrule_string = models.TextField(help_text="Standard RFC 5545 RRULE string (e.g. FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=12)")
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Offer(models.Model):
    """
    Shift offer sent to a matched candidate.
    """
    OFFER_STATUSES = [
        ('pending', 'Pending Acceptance'),
        ('accepted', 'Accepted (First-Accept-Wins)'),
        ('declined', 'Declined by Candidate'),
        ('expired', 'Expired'),
        ('withdrawn', 'Withdrawn by Facility'),
    ]

    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='offers')
    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='offers')
    match_score = models.ForeignKey('matching.MatchScore', on_delete=models.SET_NULL, null=True, blank=True, related_name='offers')
    status = models.CharField(max_length=30, choices=OFFER_STATUSES, default='pending')
    expires_at = models.DateTimeField()
    responded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('shift', 'professional')

    def __str__(self):
        return f"Offer: {self.professional.user.get_full_name()} for Shift #{self.shift_id} ({self.status})"

class Application(models.Model):
    """
    Self-application submitted by a candidate from the shift discovery feed.
    """
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='applications')
    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(
        max_length=20,
        choices=[('submitted', 'Submitted'), ('shortlisted', 'Shortlisted'), ('accepted', 'Accepted'), ('rejected', 'Rejected')],
        default='submitted'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Waitlist(models.Model):
    """
    Secondary backup candidate queue if a confirmed professional cancels.
    """
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='waitlist_entries')
    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='waitlist_entries')
    priority_order = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
