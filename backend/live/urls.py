from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LiveStreamViewSet

router = DefaultRouter()
router.register(r'streams', LiveStreamViewSet, basename='livestream')

urlpatterns = [
    path('', include(router.urls)),
]
