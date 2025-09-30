@echo off
REM Script para iniciar RED-RED Social Network

echo === Iniciando RED-RED Social Network ===

REM Verificar si MongoDB está ejecutándose
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo Iniciando MongoDB...
    start "MongoDB" mongod --dbpath C:\data\db
    timeout /t 3
)

REM Verificar si Redis está ejecutándose (opcional)
tasklist /FI "IMAGENAME eq redis-server.exe" 2>NUL | find /I /N "redis-server.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo Redis no está ejecutándose. Los WebSockets pueden no funcionar correctamente.
    echo Instala Redis desde: https://github.com/microsoftarchive/redis/releases
)

REM Iniciar el backend Django
echo Iniciando backend Django...
start "Django Backend" cmd /k "cd /d backend && python manage.py runserver"

REM Esperar un momento para que Django se inicie
timeout /t 3

REM Iniciar el frontend React
echo Iniciando frontend React...
start "React Frontend" cmd /k "cd /d frontend && npm start"

echo === RED-RED Social Network iniciado ===
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Presiona cualquier tecla para salir...
pause >nul