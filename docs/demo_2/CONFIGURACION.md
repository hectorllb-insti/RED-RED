# 📝 Guía de Configuración de Entornos - RED-RED

Esta guía explica cómo configurar las variables de entorno para los diferentes entornos de la aplicación RED-RED.

## 📁 Estructura de Archivos de Configuración

```
RED-RED/
├── backend/
│   ├── .env                  # Archivo actual (gitignored)
│   ├── .env.example         # Plantilla con todas las variables
│   ├── .env.development     # Configuración para desarrollo
│   └── .env.production      # Configuración para producción
└── frontend/
    ├── .env                  # Archivo actual (gitignored)
    ├── .env.example         # Plantilla con todas las variables
    ├── .env.development     # Configuración para desarrollo
    └── .env.production      # Configuración para producción
```

## 🚀 Configuración Rápida

### Para Desarrollo Local

#### Backend

```bash
cd backend
cp .env.development .env
# Edita .env y ajusta LOCAL_IP con tu IP de red local
```

#### Frontend

```bash
cd frontend
cp .env.development .env.local
# Edita .env.local y ajusta las URLs con tu IP de red local
```

### Para Producción

#### Backend

```bash
cd backend
cp .env.production .env
# ⚠️ IMPORTANTE: Edita .env y cambia:
#   - SECRET_KEY (generar una nueva)
#   - ALLOWED_HOSTS (tu dominio)
#   - CORS_ALLOWED_ORIGINS (URL del frontend)
#   - DEBUG=False
```

#### Frontend

```bash
cd frontend
# No copies ningún archivo .env
# Configura las variables directamente en tu servicio de hosting
# (Vercel, Netlify, etc.)
```

## 🔧 Variables de Entorno Explicadas

### Backend - Variables Críticas

#### `SECRET_KEY` ⚠️

**Descripción:** Clave secreta de Django para firmar tokens y sesiones.

**Desarrollo:** Puedes usar la predeterminada.

**Producción:** DEBE ser única y secreta. Genera una nueva:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### `DEBUG`

**Descripción:** Modo de depuración de Django.

**Valores:** `True` o `False`

**Desarrollo:** `True` - Muestra errores detallados.

**Producción:** `False` - NUNCA uses True en producción.

#### `ALLOWED_HOSTS`

**Descripción:** Lista de hosts/dominios permitidos (separados por comas).

**Desarrollo:** `127.0.0.1,localhost,TU_IP_LOCAL`

**Producción:** `tudominio.com,www.tudominio.com,IP_SERVIDOR`

Ejemplo:

```env
ALLOWED_HOSTS=miapp.com,www.miapp.com,192.168.1.100
```

#### `LOCAL_IP`

**Descripción:** IP de tu máquina en la red local.

**¿Cómo obtenerla?**

- **Windows:** `ipconfig` → busca "IPv4 Address"
- **Linux/Mac:** `ifconfig` o `ip addr`

**Ejemplo:** `192.168.1.100` o `172.16.7.32`

#### `CORS_ALLOWED_ORIGINS`

**Descripción:** URLs permitidas para CORS (separadas por comas).

**Desarrollo:**

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.100:3000
```

**Producción:**

```env
CORS_ALLOWED_ORIGINS=https://tudominio.com,https://www.tudominio.com
```

#### `REDIS_URL`

**Descripción:** URL de conexión a Redis para WebSockets.

**Desarrollo:** Dejar vacío para usar InMemoryChannelLayer.

**Producción:** `redis://localhost:6379` o tu URL de Redis.

### Frontend - Variables Críticas

#### `REACT_APP_API_URL`

**Descripción:** URL base de la API del backend.

**Desarrollo:**

```env
REACT_APP_API_URL=http://TU_IP_LOCAL:8000/api
```

**Producción:**

```env
REACT_APP_API_URL=https://api.tudominio.com/api
```

#### `REACT_APP_WS_URL`

**Descripción:** URL base para WebSockets.

**Protocolo:**

- `ws://` para HTTP
- `wss://` para HTTPS

**Desarrollo:**

```env
REACT_APP_WS_URL=ws://TU_IP_LOCAL:8000
```

**Producción:**

```env
REACT_APP_WS_URL=wss://api.tudominio.com
```

## 🌐 Configuración para Acceso en Red Local

Si quieres acceder a la aplicación desde otros dispositivos en tu red local:

### 1. Obtén tu IP local

**Windows:**

```bash
ipconfig
```

Busca "Dirección IPv4" (ejemplo: `192.168.1.100`)

### 2. Configura el Backend

Edita `backend/.env`:

```env
LOCAL_IP=192.168.1.100
ALLOWED_HOSTS=127.0.0.1,localhost,192.168.1.100,0.0.0.0
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://192.168.1.100:3000
```

### 3. Configura el Frontend

Edita `frontend/.env.local`:

```env
REACT_APP_API_URL=http://192.168.1.100:8000/api
REACT_APP_WS_URL=ws://192.168.1.100:8000
```

### 4. Inicia los Servidores

```bash
# Backend
cd backend
python manage.py runserver 0.0.0.0:8000

# Frontend (en otra terminal)
cd frontend
set HOST=0.0.0.0 && npm start
```

### 5. Accede desde Otro Dispositivo

- En el navegador: `http://192.168.1.100:3000`
- Asegúrate de que el firewall permita conexiones en los puertos 3000 y 8000

## 🔒 Checklist de Seguridad para Producción

Antes de desplegar en producción, verifica:

### Backend

- [ ] `DEBUG=False`
- [ ] `SECRET_KEY` única y segura (no la del ejemplo)
- [ ] `ALLOWED_HOSTS` solo incluye tu dominio real
- [ ] `CORS_ALLOWED_ORIGINS` solo incluye URLs del frontend
- [ ] `CORS_ALLOW_ALL_ORIGINS=False`
- [ ] `SECURE_SSL_REDIRECT=True` (si usas HTTPS)
- [ ] `SESSION_COOKIE_SECURE=True` (si usas HTTPS)
- [ ] `CSRF_COOKIE_SECURE=True` (si usas HTTPS)
- [ ] Redis configurado para WebSockets
- [ ] Base de datos de producción configurada (PostgreSQL/MongoDB)

### Frontend

- [ ] URLs apuntan al backend de producción
- [ ] Protocolo `wss://` para WebSockets
- [ ] Variables configuradas en el servicio de hosting
- [ ] `.env.local` en `.gitignore`

## 🎯 Cambiar entre Entornos

### Opción 1: Copiar Archivos

```bash
# Cambiar a desarrollo
cp .env.development .env

# Cambiar a producción
cp .env.production .env
```

### Opción 2: Variable de Entorno (Recomendado)

Edita tu script de inicio para cargar el archivo correcto:

**Backend (manage.py o scripts):**

```python
from pathlib import Path
import os

env_file = os.getenv('DJANGO_ENV', 'development')
env_path = Path(__file__).resolve().parent / f'.env.{env_file}'

if env_path.exists():
    from decouple import Config, RepositoryEnv
    config = Config(RepositoryEnv(str(env_path)))
```

## 📊 Límites de Archivos

Puedes ajustar los límites de tamaño de archivos:

```env
# Backend
MAX_PROFILE_IMAGE_SIZE=5      # MB
MAX_COVER_IMAGE_SIZE=10       # MB
MAX_POST_IMAGE_SIZE=10        # MB
ALLOWED_IMAGE_FORMATS=image/jpeg,image/png,image/webp,image/gif

# Frontend
REACT_APP_MAX_FILE_SIZE=10    # MB
REACT_APP_ALLOWED_IMAGE_FORMATS=image/jpeg,image/png,image/webp,image/gif
```

## 🐛 Solución de Problemas

### Error: "Invalid HTTP_HOST header"

**Solución:** Añade el host a `ALLOWED_HOSTS` en backend/.env

### Error: CORS al hacer peticiones

**Solución:** Añade la URL del frontend a `CORS_ALLOWED_ORIGINS`

### WebSockets no funcionan

**Solución:**

- Verifica que `REACT_APP_WS_URL` apunte al backend
- En producción, usa `wss://` en lugar de `ws://`
- Verifica que Redis esté configurado en producción

### Imágenes no se cargan

**Solución:**

- Verifica rutas de `MEDIA_URL` y `MEDIA_ROOT`
- Asegúrate de servir archivos media correctamente en producción

## 📚 Recursos Adicionales

- [Django Settings](https://docs.djangoproject.com/en/stable/ref/settings/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Create React App Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

## ⚙️ Comandos Útiles

### Generar SECRET_KEY

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Ver IP Local

```bash
# Windows
ipconfig

# Linux/Mac
ip addr show
ifconfig
```

### Verificar Configuración

```bash
# Backend
cd backend
python manage.py check --deploy

# Ver configuración actual
python manage.py shell
>>> from django.conf import settings
>>> print(settings.DEBUG)
>>> print(settings.ALLOWED_HOSTS)
```

## 🤝 Contribuir

Si encuentras errores o quieres mejorar la configuración, por favor abre un issue o pull request.

---

**Última actualización:** Noviembre 2025
**Versión:** 1.0.0
