import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from live.models import LiveStream
from django.utils import timezone
from datetime import timedelta

# Obtener todos los streams en estado waiting o live
old_streams = LiveStream.objects.filter(
    status__in=['waiting', 'live']
)

print(f"Streams activos encontrados: {old_streams.count()}\n")

for stream in old_streams:
    print(f"ID: {stream.id}")
    print(f"  Streamer: {stream.streamer.username}")
    print(f"  Status: {stream.status}")
    print(f"  Title: {stream.title}")
    print(f"  Created: {stream.created_at}")
    
    # Si el stream está en waiting por más de 1 hora, finalizarlo
    if stream.status == 'waiting':
        time_diff = timezone.now() - stream.created_at
        if time_diff > timedelta(hours=1):
            stream.status = 'ended'
            stream.ended_at = timezone.now()
            stream.save()
            print(f"  ✓ Stream finalizado (waiting > 1 hora)")
    
    # Si el stream está en live por más de 12 horas, finalizarlo
    elif stream.status == 'live':
        if stream.started_at:
            time_diff = timezone.now() - stream.started_at
            if time_diff > timedelta(hours=12):
                stream.end_stream()
                print(f"  ✓ Stream finalizado (live > 12 horas)")
    
    print()

print("\nLimpieza completada")
