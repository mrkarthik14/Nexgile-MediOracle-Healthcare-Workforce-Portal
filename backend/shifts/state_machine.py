from django.core.exceptions import ValidationError
from django.utils import timezone
from core.models import AuditEvent

class ShiftStateMachine:
    """
    Explicit transition table governing Shift lifecycle states.
    Validates legal transitions, validates eligibility prerequisites,
    and dispatches AuditEvents and notification fan-outs.
    """

    TRANSITIONS = {
        'draft': ['posted', 'cancelled'],
        'posted': ['offered', 'confirmed', 'cancelled'],
        'offered': ['confirmed', 'posted', 'cancelled'],
        'confirmed': ['in_progress', 'cancelled'],
        'in_progress': ['completed', 'disputed'],
        'completed': ['disputed'],
        'cancelled': [],
        'disputed': ['completed', 'cancelled'],
    }

    @classmethod
    def can_transition(cls, current_status: str, target_status: str) -> bool:
        return target_status in cls.TRANSITIONS.get(current_status, [])

    @classmethod
    def transition(cls, shift, target_status: str, actor=None, reason: str = ""):
        current_status = shift.status

        if not cls.can_transition(current_status, target_status):
            raise ValidationError(
                f"Illegal shift transition from '{current_status}' to '{target_status}'. "
                f"Allowed target states: {cls.TRANSITIONS.get(current_status, [])}"
            )

        # Eligibility re-validation on confirmation and shift start
        if target_status in ['confirmed', 'in_progress'] and shift.assigned_professional:
            from compliance.eligibility import EligibilityService
            eligible, failure_reason = EligibilityService.validate_shift_eligibility(
                professional=shift.assigned_professional,
                shift=shift
            )
            if not eligible:
                raise ValidationError(f"Eligibility Re-validation Failed: {failure_reason}")

        before_state = {'status': current_status, 'assigned_professional_id': getattr(shift.assigned_professional, 'id', None)}

        # Update state
        shift.status = target_status
        shift.save(update_fields=['status', 'updated_at'])

        after_state = {'status': target_status, 'assigned_professional_id': getattr(shift.assigned_professional, 'id', None)}

        # Write immutable audit trail
        AuditEvent.objects.create(
            actor=actor,
            action=f"shift_transition_{target_status}",
            target_type="Shift",
            target_id=str(shift.id),
            before_state=before_state,
            after_state=after_state,
            metadata={'reason': reason, 'facility_id': shift.department.facility_id}
        )

        # Hook point for Notification Fan-out
        try:
            from support.notifications import NotificationService
            NotificationService.dispatch(
                event_type=f"shift_{target_status}",
                recipients=[shift.department.facility.organization.code],
                payload={'shift_id': shift.id, 'status': target_status, 'reason': reason}
            )
        except Exception:
            pass

        return shift
