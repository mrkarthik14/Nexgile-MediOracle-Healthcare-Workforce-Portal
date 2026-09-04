from rest_framework import viewsets, permissions, views, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import ClockEvent, Timesheet, Incident
from .serializers import ClockEventSerializer, TimesheetSerializer, IncidentSerializer
from .geofence import GeofenceValidationService
from shifts.models import Shift
from shifts.state_machine import ShiftStateMachine
from core.models import AuditEvent

class ClockPunchView(views.APIView):
    """
    GPS-gated punch endpoint for in/out/break events.
    Verifies candidate geofence proximity against facility boundary.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        shift_id = request.data.get('shift_id')
        event_type = request.data.get('event_type') # 'in', 'out', 'break_start', 'break_end'
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        source = request.data.get('source', 'app')

        shift = get_object_or_404(Shift, id=shift_id)
        facility = shift.department.facility
        profile = request.user.professional_profile

        # Server-side geofence validation
        is_verified = True
        explanation = "OK"
        if lat and lng:
            is_verified, dist_meters, explanation = GeofenceValidationService.validate_punch_location(
                facility=facility,
                user_lat=float(lat),
                user_lon=float(lng)
            )
            if not is_verified:
                return Response({'error': explanation, 'distance_meters': dist_meters}, status=status.HTTP_400_BAD_REQUEST)

        punch = ClockEvent.objects.create(
            shift=shift,
            professional=profile,
            event_type=event_type,
            timestamp=timezone.now(),
            gps_latitude=lat,
            gps_longitude=lng,
            source=source,
            is_geofence_verified=is_verified
        )

        # Transition shift states automatically
        if event_type == 'in' and shift.status == 'confirmed':
            ShiftStateMachine.transition(shift, 'in_progress', actor=request.user, reason='Professional clocked in via GPS')
        elif event_type == 'out' and shift.status == 'in_progress':
            ShiftStateMachine.transition(shift, 'completed', actor=request.user, reason='Professional clocked out via GPS')

        return Response({
            'message': f"Clock {event_type.upper()} recorded successfully",
            'punch': ClockEventSerializer(punch).data,
            'geofence_note': explanation
        })

class TimesheetViewSet(viewsets.ModelViewSet):
    serializer_class = TimesheetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.primary_role == 'professional':
            return Timesheet.objects.filter(shift__assigned_professional__user=user)
        return Timesheet.objects.all()

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        timesheet = self.get_object()
        if timesheet.approval_status == 'approved':
            return Response({'message': 'Timesheet is already approved and locked.'})

        timesheet.approval_status = 'approved'
        timesheet.approver = request.user
        timesheet.approved_at = timezone.now()
        timesheet.save()

        AuditEvent.objects.create(
            actor=request.user,
            action="timesheet_approved_and_locked",
            target_type="Timesheet",
            target_id=str(timesheet.id),
            metadata={'total_hours': str(timesheet.total_billable_hours), 'shift_id': timesheet.shift_id}
        )

        return Response({'message': 'Timesheet approved and locked.', 'timesheet': TimesheetSerializer(timesheet).data})

class IncidentViewSet(viewsets.ModelViewSet):
    serializer_class = IncidentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Incident.objects.all()

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
