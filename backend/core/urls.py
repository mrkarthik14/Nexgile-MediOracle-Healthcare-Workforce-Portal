from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FacilityViewSet, DepartmentViewSet, AuditEventViewSet

router = DefaultRouter()
router.register(r'facilities', FacilityViewSet, basename='facility')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'audit-events', AuditEventViewSet, basename='audit-event')

urlpatterns = [
    path('', include(router.urls)),
]
