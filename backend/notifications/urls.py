from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:notification_id>/read/', views.mark_notification_read, name='mark-notification-read'),
    path('<int:notification_id>/delete/', views.delete_notification, name='delete-notification'),
    path('bulk-mark-read/', views.bulk_mark_read, name='bulk-mark-read'),
    path('bulk-delete/', views.bulk_delete, name='bulk-delete'),
]