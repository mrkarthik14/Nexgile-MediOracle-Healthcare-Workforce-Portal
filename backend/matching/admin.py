from django.contrib import admin
from .models import MatchScore

@admin.register(MatchScore)
class MatchScoreAdmin(admin.ModelAdmin):
    list_display = ('professional', 'shift', 'total_score', 'model_version', 'overridden_by', 'is_rest_period_warning')
    list_filter = ('model_version', 'is_rest_period_warning')
    search_fields = ('professional__user__last_name', 'shift__specialty')
