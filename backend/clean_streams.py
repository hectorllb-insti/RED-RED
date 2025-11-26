import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from live.models import LiveStream

# Finalizar TODAS las transmisiones (waiting, live, etc.)
all_active_streams = LiveStream.objects.filter(status__in=['waiting', 'live'])
count = all_active_streams.count()

print(f"🔍 Encontradas {count} transmisiones activas/en espera\n")

for stream in all_active_streams:
    print(f"   📺 {stream.title} (ID: {stream.id}) - Estado: {stream.status}")
    print(f"      Streamer: {stream.streamer.username}")
    stream.end_stream()
    print(f"      ✅ Finalizada\n")

print(f"🎉 Total de transmisiones finalizadas: {count}\n")

# Mostrar estado actual
print("📊 Estado actual de la base de datos:")
print(f"   - Total de transmisiones: {LiveStream.objects.all().count()}")
print(f"   - En espera (waiting): {LiveStream.objects.filter(status='waiting').count()}")
print(f"   - En vivo (live): {LiveStream.objects.filter(status='live').count()}")
print(f"   - Finalizadas (ended): {LiveStream.objects.filter(status='ended').count()}")
