import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from live.models import LiveStream
print(f'Streams: {list(LiveStream.objects.values_list("id", "status"))}')
