"""
Script para hacer admin al primer usuario registrado
"""
from django.contrib.auth import get_user_model

User = get_user_model()

# Obtener el primer usuario
try:
    user = User.objects.first()
    if user:
        user.role = 'admin'
        user.save()
        print(f"✅ Usuario {user.username} ({user.email}) es ahora ADMIN")
    else:
        print("❌ No hay usuarios en la base de datos")
except Exception as e:
    print(f"❌ Error: {e}")
