import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from live.models import LiveStream

# Obtener el primer usuario
user = User.objects.first()
if not user:
    print("No hay usuarios en la base de datos")
    exit()

print(f"Usuario: {user.username}")

# Verificar si tiene streams activos
active_streams = LiveStream.objects.filter(
    streamer=user,
    status__in=['waiting', 'live']
)

print(f"Streams activos: {active_streams.count()}")
for stream in active_streams:
    print(f"  - ID: {stream.id}, Status: {stream.status}, Title: {stream.title}")

# Intentar crear un nuevo stream
try:
    new_stream = LiveStream.objects.create(
        streamer=user,
        title="Test Stream",
        description="Test description"
    )
    print(f"\n✓ Stream creado exitosamente: ID {new_stream.id}")
except Exception as e:
    print(f"\n✗ Error al crear stream: {e}")
