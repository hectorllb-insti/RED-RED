import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from live.models import LiveStream
from django.utils import timezone

# Obtener TODOS los streams en estado waiting o live
active_streams = LiveStream.objects.filter(
    status__in=['waiting', 'live']
)

print(f"Streams activos encontrados: {active_streams.count()}\n")

for stream in active_streams:
    print(f"ID: {stream.id}")
    print(f"  Streamer: {stream.streamer.username}")
    print(f"  Status: {stream.status}")
    print(f"  Title: {stream.title}")
    print(f"  Created: {stream.created_at}")
    
    # Finalizar el stream
    stream.status = 'ended'
    stream.ended_at = timezone.now()
    stream.save()
    print(f"  ✓ Stream finalizado\n")

print(f"Total de streams finalizados: {active_streams.count()}")

# Verificar que no queden streams activos
remaining = LiveStream.objects.filter(status__in=['waiting', 'live']).count()
print(f"Streams activos restantes: {remaining}")
