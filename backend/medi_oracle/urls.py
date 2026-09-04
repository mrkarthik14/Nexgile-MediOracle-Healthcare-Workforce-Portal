"""
URL configuration for medi_oracle project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/core/', include('core.urls')),
    path('api/facilities/', include('facilities.urls')),
    path('api/professionals/', include('professionals.urls')),
    path('api/shifts/', include('shifts.urls')),
    path('api/matching/', include('matching.urls')),
    path('api/compliance/', include('compliance.urls')),
    path('api/timekeeping/', include('timekeeping.urls')),
    path('api/billing/', include('billing.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/support/', include('support.urls')),
]

# Wire dev URL patterns to serve uploaded media files locally
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
