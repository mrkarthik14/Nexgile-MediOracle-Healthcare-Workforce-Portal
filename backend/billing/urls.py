from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, PaymentViewSet, AdjustmentViewSet, TaxDocumentViewSet

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'adjustments', AdjustmentViewSet, basename='adjustment')
router.register(r'tax-documents', TaxDocumentViewSet, basename='tax-document')

urlpatterns = [
    path('', include(router.urls)),
]
