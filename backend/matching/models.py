from django.db import models
from django.conf import settings
from professionals.models import ProfessionalProfile
from shifts.models import Shift

class MatchScore(models.Model):
    """
    Intelligent match calculation between a candidate and an open shift.
    """
    professional = models.ForeignKey(ProfessionalProfile, on_delete=models.CASCADE, related_name='match_scores')
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE, related_name='match_scores')
    total_score = models.FloatField(help_text="Aggregate score 0-100")
    factor_breakdown = models.JSONField(help_text="Breakdown of distance, qualifications, reliability, rate, preferences")
    explanation = models.TextField(blank=True)
    model_version = models.CharField(max_length=50, default='rule-based-v1.0')
    is_rest_period_warning = models.BooleanField(default=False)
    overridden_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='overridden_matches'
    )
    override_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('professional', 'shift')
        indexes = [
            models.Index(fields=['shift', 'total_score']),
        ]

    def __str__(self):
        return f"{self.professional.user.get_full_name()} -> Shift #{self.shift_id}: {self.total_score}%"
