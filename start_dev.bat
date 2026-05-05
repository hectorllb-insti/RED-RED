@echo off
echo === Iniciando RED-RED Social Network (Modo Desarrollo) ===

REM Iniciar el backend Django usando el entorno virtual
echo Iniciando backend Django...
start "Django Backend" cmd /k "cd /d backend && .\venv\Scripts\python.exe manage.py runserver"

REM Esperar un momento para que Django se inicie (ping como fallback de timeout)
ping -n 6 127.0.0.1 >nul

REM Iniciar el frontend React
echo Iniciando frontend React...
start "React Frontend" cmd /k "cd /d frontend && npm start"

echo.
echo === RED-RED Social Network en proceso de inicio ===
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Una vez que el frontend cargue en el navegador, podras ejecutar los tests de Cypress.
pause
