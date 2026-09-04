from django.contrib import admin
from .models import Shift, ShiftTemplate, Recurrence, Offer, Application, Waitlist

@admin.register(Shift)
class ShiftAdmin(admin.ModelAdmin):
    list_display = ('id', 'specialty', 'department', 'start_time', 'hourly_rate', 'status', 'assigned_professional')
    list_filter = ('status', 'department__facility', 'role_required')
    search_fields = ('specialty', 'department__name')

@admin.register(ShiftTemplate)
class ShiftTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'facility', 'department', 'role_required', 'duration_hours', 'base_rate')

@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ('id', 'shift', 'professional', 'status', 'expires_at')
    list_filter = ('status',)
