"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from apps.chat.middleware import JwtAuthMiddlewareStack
import apps.chat.routing
import notifications.routing
import live.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Combinar todas las rutas WebSocket
websocket_patterns = (
    apps.chat.routing.websocket_urlpatterns +
    notifications.routing.websocket_urlpatterns +
    live.routing.websocket_urlpatterns
)

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JwtAuthMiddlewareStack(
        URLRouter(websocket_patterns)
    ),
})