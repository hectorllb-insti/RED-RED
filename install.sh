#!/bin/bash

# Script de instalación para RED-RED Social Network

echo "=== Instalando RED-RED Social Network ==="

# Verificar si Python está instalado
if ! command -v python &> /dev/null; then
    echo "Error: Python no está instalado"
    exit 1
fi

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Error: Node.js no está instalado"
    exit 1
fi

# Instalar dependencias del backend
echo "Instalando dependencias del backend..."
cd backend
pip install -r requirements.txt

# Copiar archivo de configuración
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Archivo .env creado. Ajusta las configuraciones según sea necesario."
fi

# Crear migraciones
echo "Creando migraciones de Django..."
python manage.py makemigrations
python manage.py migrate

# Crear superusuario (opcional)
echo "¿Deseas crear un superusuario? (y/N)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    python manage.py createsuperuser
fi

# Instalar dependencias del frontend
echo "Instalando dependencias del frontend..."
cd ../frontend
npm install

echo "=== Instalación completada ==="
echo ""
echo "Para iniciar la aplicación:"
echo "1. Backend: cd backend && python manage.py runserver"
echo "2. Frontend: cd frontend && npm start"
echo "3. MongoDB: Asegúrate de que MongoDB esté ejecutándose"
echo "4. Redis: Asegúrate de que Redis esté ejecutándose (para WebSockets)"