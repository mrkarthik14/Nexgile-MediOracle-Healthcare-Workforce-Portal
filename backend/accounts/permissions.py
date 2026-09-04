from rest_framework import permissions

class HasRole(permissions.BasePermission):
    """
    Factory-style or parameterized role validator.
    Usage: permission_classes = [HasRole('facility_admin', 'ward_lead')]
    """
    def __init__(self, *allowed_roles):
        self.allowed_roles = allowed_roles

    def __call__(self):
        return self

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if request.user.primary_role in self.allowed_roles:
            return True
        # Also check multi-role organization memberships
        user_roles = request.user.memberships.values_list('role', flat=True)
        return any(role in self.allowed_roles for role in user_roles)

class IsFacilityAdmin(HasRole):
    def __init__(self):
        super().__init__('facility_admin')

class IsWardLead(HasRole):
    def __init__(self):
        super().__init__('ward_lead', 'facility_admin')

class IsProfessional(HasRole):
    def __init__(self):
        super().__init__('professional')

class IsAgencyAdmin(HasRole):
    def __init__(self):
        super().__init__('agency_admin')

class IsComplianceOfficer(HasRole):
    def __init__(self):
        super().__init__('compliance_officer', 'agency_admin')

class IsPayrollManager(HasRole):
    def __init__(self):
        super().__init__('payroll', 'finance', 'agency_admin')

class IsSupportAgent(HasRole):
    def __init__(self):
        super().__init__('support_agent', 'agency_admin')

class IsFacilityMember(permissions.BasePermission):
    """
    Checks that the user has an active membership in the target facility or its parent organization.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True
        facility = getattr(obj, 'facility', None)
        if not facility and hasattr(obj, 'department'):
            facility = obj.department.facility
        if not facility:
            return True

        user_org_ids = request.user.memberships.values_list('organization_id', flat=True)
        user_facility_ids = request.user.memberships.filter(facility__isnull=False).values_list('facility_id', flat=True)

        if facility.id in user_facility_ids:
            return True
        if facility.organization_id in user_org_ids and not user_facility_ids.exists():
            return True
        return False
