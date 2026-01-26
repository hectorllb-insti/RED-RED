from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import LiveStream, LiveStreamComment
from .serializers import (
    LiveStreamSerializer, 
    LiveStreamListSerializer,
    LiveStreamCommentSerializer
)
from .utils import notify_followers_live_stream


class LiveStreamViewSet(viewsets.ModelViewSet):
    """ViewSet para gestionar transmisiones en vivo"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = LiveStream.objects.select_related('streamer').all()
        
        # Filtrar por estado
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return LiveStreamListSerializer
        return LiveStreamSerializer
    
    def perform_create(self, serializer):
        # Si hay streams activos, cerrarlos automáticamente para evitar bloqueos
        active_streams = LiveStream.objects.filter(
            streamer=self.request.user,
            status__in=['waiting', 'live']
        )
        
        for stream in active_streams:
            stream.status = 'ended'
            stream.save()
        
        serializer.save(streamer=self.request.user)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Iniciar la transmisión"""
        live_stream = self.get_object()
        
        # Verificar que el usuario sea el streamer
        if live_stream.streamer != request.user:
            return Response(
                {'error': 'No tienes permiso para iniciar esta transmisión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if live_stream.status != 'waiting':
            return Response(
                {'error': 'La transmisión ya ha sido iniciada o finalizada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        live_stream.start_stream()
        
        # Notificar a los seguidores
        notify_followers_live_stream(live_stream)
        
        # Notificar a los espectadores conectados
        from .utils import broadcast_stream_update
        broadcast_stream_update(live_stream.id, 'stream_started')
        
        serializer = self.get_serializer(live_stream)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        """Finalizar la transmisión"""
        live_stream = self.get_object()
        
        # Verificar que el usuario sea el streamer
        if live_stream.streamer != request.user:
            return Response(
                {'error': 'No tienes permiso para finalizar esta transmisión'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if live_stream.status != 'live':
            return Response(
                {'error': 'La transmisión no está activa'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        live_stream.end_stream()
        serializer = self.get_serializer(live_stream)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Obtener todas las transmisiones activas"""
        active_streams = LiveStream.objects.filter(
            status='live'
        ).select_related('streamer').order_by('-started_at')
        
        serializer = LiveStreamListSerializer(active_streams, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Obtener comentarios de una transmisión"""
        live_stream = self.get_object()
        comments = live_stream.comments.select_related('user').all()
        serializer = LiveStreamCommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        """Agregar un comentario a la transmisión"""
        live_stream = self.get_object()
        
        if live_stream.status != 'live':
            return Response(
                {'error': 'La transmisión no está activa'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = LiveStreamCommentSerializer(data=request.data)
        if serializer.is_valid():
            comment = serializer.save(
                user=request.user,
                live_stream=live_stream
            )
            
            # Broadcast del comentario vía WebSocket
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            
            channel_layer = get_channel_layer()
            room_group_name = f'live_stream_{live_stream.id}'
            
            async_to_sync(channel_layer.group_send)(
                room_group_name,
                {
                    'type': 'new_comment',
                    'comment': serializer.data
                }
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
