from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Shift, ShiftTemplate, Recurrence, Offer
from .serializers import ShiftSerializer, OfferSerializer, ShiftTemplateSerializer
from .state_machine import ShiftStateMachine
from dateutil import rrule
from datetime import datetime

class ShiftViewSet(viewsets.ModelViewSet):
    serializer_class = ShiftSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Shift.objects.all()

        # Scoped to user's facility if facility staff
        if user.primary_role in ['facility_admin', 'ward_lead']:
            qs = Shift.objects.for_user(user)

        # Filters
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        department_id = self.request.query_params.get('department_id')
        if department_id:
            qs = qs.filter(department_id=department_id)

        since = self.request.query_params.get('since')
        if since:
            qs = qs.filter(updated_at__gte=since)

        return qs.select_related('department', 'department__facility', 'assigned_professional__user')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='transition')
    def transition_state(self, request, pk=None):
        shift = self.get_object()
        target_status = request.data.get('target_status')
        reason = request.data.get('reason', '')

        try:
            updated_shift = ShiftStateMachine.transition(
                shift=shift,
                target_status=target_status,
                actor=request.user,
                reason=reason
            )
            return Response(ShiftSerializer(updated_shift).data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='bulk-from-template')
    def bulk_create_recurring(self, request):
        """
        Creates recurring shifts based on RRULE recurrence specification.
        """
        template_id = request.data.get('template_id')
        rrule_string = request.data.get('rrule_string') # e.g. FREQ=DAILY;COUNT=5
        start_date_str = request.data.get('start_date') # '2026-09-05'

        template = ShiftTemplate.objects.get(id=template_id)
        start_dt = datetime.strptime(start_date_str, "%Y-%m-%d")

        # Parse RRULE rule
        rule_set = rrule.rrulestr(rrule_string, dtstart=start_dt)
        created_shifts = []

        for dt in list(rule_set)[:14]: # Cap at 14 shifts per batch
            shift = Shift.objects.create(
                department=template.department,
                role_required=template.role_required,
                specialty=template.specialty,
                start_time=timezone.make_aware(dt),
                end_time=timezone.make_aware(dt + timezone.timedelta(hours=float(template.duration_hours))),
                hourly_rate=template.base_rate,
                status='posted',
                created_by=request.user
            )
            created_shifts.append(shift)

        return Response({
            'created_count': len(created_shifts),
            'shift_ids': [s.id for s in created_shifts]
        }, status=status.HTTP_201_CREATED)

class OfferViewSet(viewsets.ModelViewSet):
    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.primary_role == 'professional':
            return Offer.objects.filter(professional__user=user)
        return Offer.objects.all()

    @action(detail=True, methods=['post'], url_path='accept')
    def accept_offer(self, request, pk=None):
        offer = self.get_object()
        shift = offer.shift

        # First-accept-wins atomic lock
        if shift.status in ['confirmed', 'in_progress', 'completed']:
            return Response({'error': 'Shift has already been confirmed by another professional.'}, status=status.HTTP_409_CONFLICT)

        offer.status = 'accepted'
        offer.responded_at = timezone.now()
        offer.save()

        shift.assigned_professional = offer.professional
        ShiftStateMachine.transition(shift, 'confirmed', actor=request.user, reason='Candidate accepted offer')

        # Expire all other pending offers for this shift
        shift.offers.exclude(id=offer.id).filter(status='pending').update(status='expired')

        return Response({'message': 'Shift confirmed successfully!', 'shift_id': shift.id})
