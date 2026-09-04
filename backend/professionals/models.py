from django.db import models
from django.conf import settings
from core.models import Organization, Facility

class ProfessionalProfile(models.Model):
    """
    Healthcare worker profile (nurse, healthcare assistant, doctor, allied health).
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='professional_profile')
    title = models.CharField(max_length=50, blank=True)
    primary_specialty = models.CharField(max_length=100, help_text="e.g. Critical Care ICU, Emergency, Pediatrics, Med-Surg")
    secondary_specialties = models.JSONField(default=list, blank=True)
    years_experience = models.PositiveIntegerField(default=1)
    home_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    home_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    max_travel_distance_miles = models.PositiveIntegerField(default=25)
    hourly_rate_desired = models.DecimalField(max_digits=8, decimal_places=2, default=45.00)
    reliability_score = models.FloatField(default=98.5, help_text="Percentage based on historical on-time and attendance")
    instant_pay_eligible = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.primary_specialty}"

class Qualification(models.Model):
    """
    Degree, diploma, or certification type (e.g. BSN, RN, BLS, ACLS, PALS).
    """
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    category = models.CharField(max_length=50, choices=[
        ('degree', 'Academic Degree'),
        ('license', 'Professional License'),
        ('clinical_cert', 'Clinical Certification'),
        ('statutory_training', 'Statutory / Mandatory Training'),
        ('immunization', 'Immunization / Occupational Health'),
    ])
    description = models.TextField(blank=True)
    is_mandatory_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.code})"

class Credential(models.Model):
    """
    Professional's verified license, certificate, or immunization evidence.
    """
    VERIFICATION_STATUSES = [
        ('pending', 'Pending Verification'),
        ('verified', 'Verified & Active'),
        ('rejected', 'Rejected'),
        ('expired', 'Expired'),
        ('grace_period', 'In Grace Period (Expiring Soon)'),
    ]

    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='credentials')
    qualification = models.ForeignKey(Qualification, on_delete=models.CASCADE, related_name='credentials')
    document_number = models.CharField(max_length=100, blank=True)
    document_file = models.FileField(upload_to='credentials/%Y/%m/', null=True, blank=True)
    issuer = models.CharField(max_length=200, help_text="e.g. Nursing & Midwifery Council, American Heart Association")
    issued_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    verification_status = models.CharField(max_length=30, choices=VERIFICATION_STATUSES, default='pending')
    verifier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_credentials'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    source_check_ref = models.CharField(max_length=100, blank=True, help_text="External registry verification reference ID")
    version = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['professional', 'verification_status']),
            models.Index(fields=['expiry_date']),
        ]

    def __str__(self):
        return f"{self.professional.user.get_full_name()} - {self.qualification.name} ({self.verification_status})"

class Availability(models.Model):
    """
    Weekly or calendar date availability blocks.
    """
    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.PositiveSmallIntegerField(
        choices=[(0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday')],
        null=True, blank=True
    )
    specific_date = models.DateField(null=True, blank=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_recurring = models.BooleanField(default=True)
    is_unavailable = models.BooleanField(default=False, help_text="Mark block as explicitly unavailable/PTO")

class Preference(models.Model):
    """
    Work preferences: shift lengths, preferred facilities, avoid facilities.
    """
    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='preferences')
    preferred_shift_length = models.CharField(max_length=20, default='12h', choices=[('8h', '8 Hours'), ('12h', '12 Hours')])
    preferred_times = models.CharField(max_length=20, default='day', choices=[('day', 'Day Shifts'), ('night', 'Night Shifts'), ('any', 'Flexible')])
    preferred_facilities = models.ManyToManyField(Facility, blank=True, related_name='preferred_by_professionals')
    blocked_facilities = models.ManyToManyField(Facility, blank=True, related_name='blocked_by_professionals')
    min_rate = models.DecimalField(max_digits=8, decimal_places=2, default=35.00)

class Reference(models.Model):
    """
    Pre-employment or peer reference request.
    """
    STATUS_CHOICES = [
        ('requested', 'Requested'),
        ('submitted', 'Submitted'),
        ('verified', 'Verified'),
        ('declined', 'Declined'),
    ]

    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='references')
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_references')
    respondent_name = models.CharField(max_length=150)
    respondent_email = models.EmailField()
    respondent_title = models.CharField(max_length=100)
    respondent_hospital = models.CharField(max_length=200)
    questionnaire = models.JSONField(default=dict, blank=True)
    overall_score = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
