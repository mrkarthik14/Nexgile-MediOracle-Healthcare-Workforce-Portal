from rest_framework import viewsets, permissions, views, status
from rest_framework.response import Response
from .models import ProfessionalProfile, Qualification, Credential, Reference
from .serializers import ProfessionalProfileSerializer, QualificationSerializer, CredentialSerializer, ReferenceSerializer

class ProfessionalProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfessionalProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.primary_role == 'professional':
            return ProfessionalProfile.objects.filter(user=user)
        # Agency and facility admins can view candidate profiles
        return ProfessionalProfile.objects.filter(is_active=True)

class CredentialViewSet(viewsets.ModelViewSet):
    serializer_class = CredentialSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.primary_role == 'professional':
            return Credential.objects.filter(professional__user=user)
        return Credential.objects.all()

    def perform_create(self, serializer):
        profile = getattr(self.request.user, 'professional_profile', None)
        serializer.save(professional=profile)

class QualificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Qualification.objects.all()
    serializer_class = QualificationSerializer
    permission_classes = [permissions.IsAuthenticated]
