from rest_framework import viewsets, permissions
from .models import Organization, Facility, Site, Department, AuditEvent
from .serializers import OrganizationSerializer, FacilitySerializer, SiteSerializer, DepartmentSerializer, AuditEventSerializer

class FacilityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FacilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Facility.objects.for_user(self.request.user)

class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Department.objects.for_user(self.request.user)

class AuditEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditEventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = AuditEvent.objects.all()
        target_type = self.request.query_params.get('target_type')
        target_id = self.request.query_params.get('target_id')
        if target_type:
            qs = qs.filter(target_type=target_type)
        if target_id:
            qs = qs.filter(target_id=target_id)
        return qs[:100]
