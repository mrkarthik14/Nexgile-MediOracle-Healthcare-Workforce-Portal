from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClockPunchView, TimesheetViewSet, IncidentViewSet

router = DefaultRouter()
router.register(r'timesheets', TimesheetViewSet, basename='timesheet')
router.register(r'incidents', IncidentViewSet, basename='incident')

urlpatterns = [
    path('punch/', ClockPunchView.as_view(), name='clock_punch'),
    path('', include(router.urls)),
]
