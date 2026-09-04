from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfessionalProfileViewSet, CredentialViewSet, QualificationViewSet

router = DefaultRouter()
router.register(r'profiles', ProfessionalProfileViewSet, basename='professional-profile')
router.register(r'credentials', CredentialViewSet, basename='credential')
router.register(r'qualifications', QualificationViewSet, basename='qualification')

urlpatterns = [
    path('', include(router.urls)),
]
