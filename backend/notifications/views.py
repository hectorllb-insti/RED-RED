from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Notification.objects.filter(recipient=self.request.user)
        filter_type = self.request.query_params.get('filter', None)

        if filter_type == 'unread':
            queryset = queryset.filter(is_read=False)
        elif filter_type == 'read':
            queryset = queryset.filter(is_read=True)

        return queryset


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    try:
        notification = get_object_or_404(
            Notification,
            id=notification_id,
            recipient=request.user
        )
        notification.is_read = True
        notification.save()
        return Response({'status': 'success'})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_unread(request, notification_id):
    """Marcar una notificación individual como NO leída."""
    try:
        notification = get_object_or_404(
            Notification,
            id=notification_id,
            recipient=request.user
        )
        notification.is_read = False
        notification.save()
        return Response({'status': 'success'})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete_notification(request, notification_id):
    try:
        notification = get_object_or_404(
            Notification,
            id=notification_id,
            recipient=request.user
        )
        notification.delete()
        return Response({'status': 'success'})
    except Notification.DoesNotExist:
        return Response(
            {'error': 'Notification not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_mark_read(request):
    notification_ids = request.data.get('notification_ids', [])

    Notification.objects.filter(
        id__in=notification_ids,
        recipient=request.user
    ).update(is_read=True)

    return Response({'status': 'success'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_delete(request):
    notification_ids = request.data.get('notification_ids', [])

    Notification.objects.filter(
        id__in=notification_ids,
        recipient=request.user
    ).delete()

    return Response({'status': 'success'})
