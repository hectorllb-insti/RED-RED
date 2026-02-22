# ============================================================
# RED-RED Backend — Dockerfile
# Django + Daphne (ASGI) — Python 3.11
# ============================================================

FROM python:3.11-slim

# Variables de entorno para evitar .pyc y buffering de logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=config.settings

WORKDIR /app

# Dependencias del sistema necesarias para Pillow y compilación
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python (requirements.txt está en la raíz del repositorio)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente del backend
COPY backend/ .

# Crear directorios necesarios
RUN mkdir -p logs \
    media/cover_pics \
    media/posts \
    media/profile_pics \
    media/stories \
    staticfiles \
    /app/db_storage

# Recolectar archivos estáticos
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Entrypoint: crea dir de datos → migraciones → Daphne (ASGI / WebSockets)
CMD ["sh", "-c", "mkdir -p /app/db_storage && python manage.py migrate --noinput && daphne -b 0.0.0.0 -p 8000 config.asgi:application"]
