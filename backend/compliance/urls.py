from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComplianceRuleViewSet, VerificationQueueViewSet, OCRScanView

router = DefaultRouter()
router.register(r'rules', ComplianceRuleViewSet, basename='compliance-rule')
router.register(r'verifications', VerificationQueueViewSet, basename='verification')

urlpatterns = [
    path('', include(router.urls)),
    path('ocr-scan/', OCRScanView.as_view(), name='ocr_scan'),
]
