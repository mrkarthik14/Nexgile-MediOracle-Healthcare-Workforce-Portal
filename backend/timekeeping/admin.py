from django.contrib import admin
from .models import ClockEvent, Timesheet, Incident

@admin.register(ClockEvent)
class ClockEventAdmin(admin.ModelAdmin):
    list_display = ('shift', 'professional', 'event_type', 'timestamp', 'is_geofence_verified', 'source')
    list_filter = ('event_type', 'is_geofence_verified', 'source')

@admin.register(Timesheet)
class TimesheetAdmin(admin.ModelAdmin):
    list_display = ('id', 'shift', 'total_billable_hours', 'approval_status', 'approver', 'approved_at')
    list_filter = ('approval_status',)

@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ('title', 'shift', 'severity', 'reporter', 'is_resolved', 'created_at')
    list_filter = ('severity', 'is_resolved')
