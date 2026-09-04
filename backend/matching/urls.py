from django.urls import path
from .views import MatchCandidatesView, OverrideMatchView, BroadcastOfferView, DemandForecastView

urlpatterns = [
    path('shifts/<int:shift_id>/candidates/', MatchCandidatesView.as_view(), name='match_candidates'),
    path('scores/<int:match_id>/override/', OverrideMatchView.as_view(), name='match_override'),
    path('shifts/<int:shift_id>/broadcast-offer/', BroadcastOfferView.as_view(), name='broadcast_offer'),
    path('departments/<int:department_id>/forecast/', DemandForecastView.as_view(), name='demand_forecast'),
]
