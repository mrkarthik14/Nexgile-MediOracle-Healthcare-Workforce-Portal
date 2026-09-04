from django.urls import path
from .views import FloorDashboardView

urlpatterns = [
    path('<int:facility_id>/floor-dashboard/', FloorDashboardView.as_view(), name='floor_dashboard'),
]
