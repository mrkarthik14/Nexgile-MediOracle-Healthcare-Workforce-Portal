from django.contrib import admin
from .models import ProfessionalProfile, Qualification, Credential, Availability, Preference, Reference

@admin.register(ProfessionalProfile)
class ProfessionalProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'primary_specialty', 'years_experience', 'reliability_score', 'hourly_rate_desired')
    search_fields = ('user__first_name', 'user__last_name', 'user__email', 'primary_specialty')

@admin.register(Qualification)
class QualificationAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'category', 'is_mandatory_default')
    list_filter = ('category',)

@admin.register(Credential)
class CredentialAdmin(admin.ModelAdmin):
    list_display = ('professional', 'qualification', 'verification_status', 'expiry_date', 'verifier')
    list_filter = ('verification_status', 'qualification__category')
    search_fields = ('professional__user__last_name', 'qualification__name', 'document_number')

@admin.register(Reference)
class ReferenceAdmin(admin.ModelAdmin):
    list_display = ('professional', 'respondent_name', 'respondent_hospital', 'overall_score', 'status')
