@echo off
REM Script de instalación para RED-RED Social Network en Windows

echo === Instalando RED-RED Social Network ===

REM Verificar si Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python no está instalado
    pause
    exit /b 1
)

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js no está instalado
    pause
    exit /b 1
)

REM Instalar dependencias del backend
echo Instalando dependencias del backend...
cd backend
pip install -r requirements.txt

REM Copiar archivo de configuración
if not exist .env (
    copy .env.example .env
    echo Archivo .env creado. Ajusta las configuraciones según sea necesario.
)

REM Crear migraciones
echo Creando migraciones de Django...
python manage.py makemigrations
python manage.py migrate

REM Instalar dependencias del frontend
echo Instalando dependencias del frontend...
cd ..\frontend
npm install

echo === Instalación completada ===
echo.
echo Para iniciar la aplicación:
echo 1. Backend: cd backend && python manage.py runserver
echo 2. Frontend: cd frontend && npm start
echo 3. MongoDB: Asegúrate de que MongoDB esté ejecutándose
echo 4. Redis: Asegúrate de que Redis esté ejecutándose (para WebSockets)
pause