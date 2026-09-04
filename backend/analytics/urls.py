from django.urls import path
from .views import ExecutiveMetricsView

urlpatterns = [
    path('metrics/', ExecutiveMetricsView.as_view(), name='executive_metrics'),
]
