from django.db import models
from django.core.exceptions import PermissionDenied, ValidationError

class TenantScopedQuerySet(models.QuerySet):
    """
    QuerySet that automatically scopes queries to the user's Organization and/or Facility.
    """
    def for_user(self, user):
        if not user or not user.is_authenticated:
            return self.none()
        if user.is_superuser:
            return self

        # Check user's organization membership
        memberships = getattr(user, 'memberships', None)
        if not memberships:
            return self.none()

        org_ids = user.memberships.values_list('organization_id', flat=True)
        facility_ids = user.memberships.filter(facility__isnull=False).values_list('facility_id', flat=True)

        model_fields = [f.name for f in self.model._meta.get_fields()]

        # Filter by organization if field exists
        qs = self
        if 'organization' in model_fields:
            qs = qs.filter(organization_id__in=org_ids)
        elif 'facility' in model_fields:
            if facility_ids.exists():
                qs = qs.filter(facility_id__in=facility_ids)
            else:
                qs = qs.filter(facility__organization_id__in=org_ids)
        elif 'department' in model_fields:
            if facility_ids.exists():
                qs = qs.filter(department__facility_id__in=facility_ids)
            else:
                qs = qs.filter(department__facility__organization_id__in=org_ids)

        return qs

class TenantScopedManager(models.Manager):
    """
    Model manager providing automatic multi-tenant segregation.
    """
    def get_queryset(self):
        return TenantScopedQuerySet(self.model, using=self._db)

    def for_user(self, user):
        return self.get_queryset().for_user(user)

class LockedModelQuerySet(models.QuerySet):
    """
    Guarantees timesheet and financial lock integrity at the QuerySet level.
    Prevents bulk .update() mutations on approved or locked records.
    """
    def update(self, **kwargs):
        # Check if any matching records are in a locked or approved state
        locked_qs = self.filter(
            models.Q(status__in=['approved', 'locked', 'paid', 'remitted']) |
            models.Q(approval_status='approved')
        )
        if locked_qs.exists():
            raise ValidationError(
                "Financial Lock Violation: Cannot bulk-update records that are in an approved/locked state. "
                "Any financial or hour adjustments must proceed through an explicit Adjustment record."
            )
        return super().update(**kwargs)

class LockedModelManager(models.Manager):
    def get_queryset(self):
        return LockedModelQuerySet(self.model, using=self._db)
