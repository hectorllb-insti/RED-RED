from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardViewSet,
    UserAdminViewSet,
    AdminLogViewSet,
    SiteConfigurationViewSet
)

router = DefaultRouter()
router.register(r'users', UserAdminViewSet, basename='admin-users')
router.register(r'logs', AdminLogViewSet, basename='admin-logs')
router.register(r'config', SiteConfigurationViewSet, basename='admin-config')

urlpatterns = [
    path('dashboard/stats/', DashboardViewSet.as_view({'get': 'stats'}), name='dashboard-stats'),
    path('', include(router.urls)),
]
