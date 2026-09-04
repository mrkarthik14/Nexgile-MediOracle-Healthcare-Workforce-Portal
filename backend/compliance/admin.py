from django.contrib import admin
from .models import ComplianceRule, Verification

@admin.register(ComplianceRule)
class ComplianceRuleAdmin(admin.ModelAdmin):
    list_display = ('name', 'organization', 'facility', 'rule_type', 'numeric_value', 'is_active')
    list_filter = ('rule_type', 'organization')

@admin.register(Verification)
class VerificationAdmin(admin.ModelAdmin):
    list_display = ('credential', 'verifier', 'decision', 'source_check_verified', 'created_at')
    list_filter = ('decision', 'source_check_verified')
