from rest_framework import viewsets, permissions, views, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import ComplianceRule, Verification
from .serializers import ComplianceRuleSerializer, VerificationSerializer
from .ocr import MockOCRService
from professionals.models import Credential
from core.models import AuditEvent

class ComplianceRuleViewSet(viewsets.ModelViewSet):
    serializer_class = ComplianceRuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ComplianceRule.objects.all()

class VerificationQueueViewSet(viewsets.ModelViewSet):
    """
    Queue for compliance officers to review and verify submitted credentials.
    """
    serializer_class = VerificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Verification.objects.all().select_related('credential', 'verifier')

    def create(self, request, *args, **kwargs):
        credential_id = request.data.get('credential_id')
        decision = request.data.get('decision') # 'verified', 'rejected'
        notes = request.data.get('notes', '')
        source_check = request.data.get('source_check_verified', True)

        credential = get_object_or_404(Credential, id=credential_id)
        credential.verification_status = decision
        credential.verifier = request.user
        credential.verified_at = timezone.now()
        credential.notes = notes
        credential.save()

        verification = Verification.objects.create(
            credential=credential,
            verifier=request.user,
            decision=decision,
            notes=notes,
            source_check_verified=source_check
        )

        AuditEvent.objects.create(
            actor=request.user,
            action=f"credential_{decision}",
            target_type="Credential",
            target_id=str(credential.id),
            metadata={'professional_id': credential.professional_id, 'notes': notes}
        )

        return Response(VerificationSerializer(verification).data, status=status.HTTP_201_CREATED)

class OCRScanView(views.APIView):
    """
    OCR intake stub for parsing uploaded credentials or paper timesheets.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file_obj = request.FILES.get('document')
        ocr_service = MockOCRService()
        extracted = ocr_service.extract_document_data(file_obj)
        return Response(extracted)
