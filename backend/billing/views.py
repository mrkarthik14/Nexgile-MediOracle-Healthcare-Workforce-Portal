from rest_framework import viewsets, permissions, views, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Invoice, Payment, Adjustment, TaxDocument
from .serializers import InvoiceSerializer, PaymentSerializer, AdjustmentSerializer, TaxDocumentSerializer
from core.models import AuditEvent

class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.primary_role in ['facility_admin', 'ward_lead']:
            return Invoice.objects.filter(facility__in=user.memberships.values_list('facility_id', flat=True))
        return Invoice.objects.all()

    @action(detail=True, methods=['post'], url_path='approve')
    def approve_invoice(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = 'approved'
        invoice.save()

        AuditEvent.objects.create(
            actor=request.user,
            action="invoice_approved_and_locked",
            target_type="Invoice",
            target_id=str(invoice.id),
            metadata={'total': str(invoice.total_amount)}
        )

        return Response(InvoiceSerializer(invoice).data)

class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.primary_role == 'professional':
            return Payment.objects.filter(professional__user=user)
        return Payment.objects.all()

    @action(detail=True, methods=['post'], url_path='claim-instant-pay')
    def claim_instant_pay(self, request, pk=None):
        payment = self.get_object()
        if payment.status in ['instant_dispatched', 'remitted']:
            return Response({'error': 'Payment has already been remitted.'}, status=status.HTTP_400_BAD_REQUEST)

        # Instant payout transfer
        fee = round(float(payment.gross_amount) * 0.015, 2) # 1.5% instant pay fee
        payment.deductions = fee
        payment.net_amount = float(payment.gross_amount) - fee
        payment.status = 'instant_dispatched'
        payment.method = 'instant_pay'
        payment.remitted_at = timezone.now()
        payment.save()

        AuditEvent.objects.create(
            actor=request.user,
            action="instant_pay_claimed",
            target_type="Payment",
            target_id=str(payment.id),
            metadata={'fee': fee, 'net_disbursed': str(payment.net_amount)}
        )

        return Response({'message': 'Instant pay disbursed successfully!', 'payment': PaymentSerializer(payment).data})

class AdjustmentViewSet(viewsets.ModelViewSet):
    """
    Exception-safe financial adjustments referencing original invoice or payment.
    """
    serializer_class = AdjustmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Adjustment.objects.all()

    def perform_create(self, serializer):
        adj = serializer.save(actor=self.request.user)
        AuditEvent.objects.create(
            actor=self.request.user,
            action="financial_adjustment_created",
            target_type="Adjustment",
            target_id=str(adj.id),
            metadata={'amount': str(adj.amount), 'reason': adj.reason}
        )

class TaxDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TaxDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.primary_role == 'professional':
            return TaxDocument.objects.filter(professional__user=user)
        return TaxDocument.objects.all()
