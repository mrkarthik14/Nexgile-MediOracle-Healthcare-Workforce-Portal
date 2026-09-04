from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from core.models import Organization, Facility

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)
        user = self.model(email=email, username=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('primary_role', 'agency_admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    """
    Custom user model with primary role and tenant membership relationships.
    """
    ROLE_CHOICES = [
        ('facility_admin', 'Facility Administrator'),
        ('ward_lead', 'Ward Lead / Charge Nurse'),
        ('finance', 'Finance Officer'),
        ('compliance_officer', 'Compliance Officer'),
        ('professional', 'Healthcare Professional (Nurse/HCA)'),
        ('agency_admin', 'Agency Administrator'),
        ('recruiter', 'Agency Recruiter'),
        ('payroll', 'Payroll Manager'),
        ('support_agent', 'Customer Support Agent'),
        ('regional_coordinator', 'Regional Coordinator'),
        ('business_leader', 'Executive Business Leader'),
    ]

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=30, blank=True)
    primary_role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='professional')
    avatar_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email}) - {self.get_primary_role_display()}"

class Role(models.Model):
    """
    Granular permission set definitions.
    """
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    permissions_list = models.JSONField(default=list, help_text="Array of granular permission strings")

    def __str__(self):
        return self.name

class OrganizationMembership(models.Model):
    """
    Tenant-scoping binding linking a User to an Organization and optional specific Facility scope.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='memberships')
    facility = models.ForeignKey(
        Facility,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='scoped_memberships',
        help_text="Null indicates organization-wide scope, otherwise restricts to specific facility"
    )
    role = models.CharField(max_length=30, choices=User.ROLE_CHOICES)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'organization', 'facility', 'role')
        indexes = [
            models.Index(fields=['user', 'organization']),
        ]

    def __str__(self):
        scope = self.facility.name if self.facility else f"{self.organization.name} (Global)"
        return f"{self.user.email} -> {self.role} @ {scope}"
