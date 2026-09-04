from rest_framework import views, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User
from .serializers import CustomTokenObtainPairSerializer, UserSerializer

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class MePermissionsView(views.APIView):
    """
    Returns the resolved role, scoped facilities, and permissions array
    used by the React app shell to determine navigation and route-guarding.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.primary_role

        # Base permissions map by role
        ROLE_PERMISSIONS = {
            'facility_admin': [
                'view_facility_portal', 'manage_floor_dashboard', 'create_shifts',
                'manage_shifts', 'approve_timesheets', 'view_budget', 'override_matching'
            ],
            'ward_lead': [
                'view_facility_portal', 'manage_floor_dashboard', 'view_shifts',
                'approve_timesheets', 'report_incidents'
            ],
            'professional': [
                'view_professional_portal', 'browse_shifts', 'apply_shifts',
                'clock_in_out', 'view_timesheets', 'view_earnings', 'upload_credentials'
            ],
            'agency_admin': [
                'view_agency_portal', 'manage_onboarding', 'verify_credentials',
                'view_agency_analytics', 'manage_billing', 'manage_users'
            ],
            'compliance_officer': [
                'view_agency_portal', 'verify_credentials', 'manage_compliance_rules',
                'export_regulatory_reports'
            ],
            'payroll': [
                'view_agency_portal', 'manage_billing', 'generate_invoices',
                'process_payments', 'review_adjustments'
            ],
            'support_agent': [
                'view_agency_portal', 'manage_support_cases', 'broadcast_notifications'
            ],
        }

        perms = ROLE_PERMISSIONS.get(role, ['view_shifts'])

        facilities = list(user.memberships.values(
            'facility_id', 'facility__name', 'organization_id', 'organization__name', 'role'
        ))

        return Response({
            'user_id': user.id,
            'role': role,
            'permissions': perms,
            'scoped_memberships': facilities,
            'is_superuser': user.is_superuser,
        })
