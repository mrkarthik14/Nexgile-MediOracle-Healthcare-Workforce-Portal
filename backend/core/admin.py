from django.contrib import admin
from .models import Organization, Facility, Site, Department, AuditEvent

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'is_active', 'created_at')
    search_fields = ('name', 'code')

@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'organization', 'geofence_radius_meters', 'is_active')
    list_filter = ('organization', 'is_active')
    search_fields = ('name', 'code')

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'facility', 'acuity_level', 'target_nurse_to_patient_ratio')
    list_filter = ('facility', 'acuity_level')

@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'action', 'target_type', 'target_id', 'actor')
    list_filter = ('action', 'target_type')
    readonly_fields = ('actor', 'action', 'target_type', 'target_id', 'before_state', 'after_state', 'metadata', 'timestamp')
