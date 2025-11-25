"""
Script para convertir a un usuario en administrador usando su email.

Úsalo desde la raíz del repo así:
  python backend/make_admin_by_email.py --email user@example.com

O desde la carpeta `backend`:
  cd backend
  python make_admin_by_email.py --email user@example.com

Opciones:
  --email       Email del usuario (obligatorio)
  --superuser   Además de is_staff, poner is_superuser=True (por defecto True)
  --yes         No pedir confirmación interactiva

El script ajusta `sys.path` para poder importar `config.settings` igual que `manage.py`.
"""
from __future__ import annotations

import argparse
import sys
import os
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Convertir usuario en administrador por email")
    parser.add_argument("--email", required=True, help="Email del usuario a promover")
    parser.add_argument("--superuser", action="store_true", default=True, help="Asignar is_superuser=True (por defecto True)")
    parser.add_argument("--no-superuser", dest="superuser", action="store_false", help="No asignar is_superuser")
    parser.add_argument("--yes", action="store_true", help="No pedir confirmación")
    args = parser.parse_args()

    # Asegurar que el paquete `config` (dentro de backend) sea importable
    base_dir = Path(__file__).resolve().parent
    if str(base_dir) not in sys.path:
        sys.path.insert(0, str(base_dir))

    # Configurar Django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    try:
        import django
        django.setup()
    except Exception as e:
        print(f"❌ Error inicializando Django: {e}")
        return 2

    try:
        from django.contrib.auth import get_user_model
    except Exception as e:
        print(f"❌ Error importando get_user_model: {e}")
        return 2

    User = get_user_model()

    email = args.email.strip()
    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        print(f"❌ No se encontró ningún usuario con email: {email}")
        return 1
    except Exception as e:
        print(f"❌ Error consultando la base de datos: {e}")
        return 2

    print(f"Usuario encontrado: {getattr(user, 'username', '(sin username)')} ({getattr(user, 'email', '')})")
    print("Cambios propuestos:")
    print(" - is_staff = True")
    if args.superuser:
        print(" - is_superuser = True")
    if hasattr(user, 'role'):
        print(" - role = 'admin'")

    if not args.yes:
        confirm = input("¿Confirmas aplicar estos cambios? [y/N]: ").strip().lower()
        if confirm not in ("y", "yes"):
            print("Operación cancelada por el usuario")
            return 0

    try:
        user.is_staff = True
        if args.superuser:
            user.is_superuser = True

        if hasattr(user, 'role'):
            try:
                setattr(user, 'role', 'admin')
            except Exception:
                # Campo role puede no permitir este valor; ignorar si falla
                pass

        user.save()
        print(f"✅ Usuario {getattr(user, 'username', '')} ({user.email}) actualizado: is_staff={user.is_staff}, is_superuser={getattr(user, 'is_superuser', False)}")
        return 0
    except Exception as e:
        print(f"❌ Error guardando usuario: {e}")
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
