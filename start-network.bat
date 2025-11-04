@echo off
echo ========================================
echo   Iniciando RED-RED en Red Local
echo   IP: 172.16.7.32
echo ========================================
echo.

echo [1/2] Iniciando Backend Django...
cd backend
start cmd /k "call ..\.venv\Scripts\activate.bat && python manage.py runserver 0.0.0.0:8000"
echo     Backend corriendo en: http://172.16.7.32:8000
echo.

timeout /t 3 /nobreak >nul

echo [2/2] Iniciando Frontend React...
cd ..\frontend
start cmd /k "set HOST=0.0.0.0&& npm start"
echo     Frontend corriendo en: http://172.16.7.32:3000
echo.

echo ========================================
echo   Servicios iniciados correctamente!
echo ========================================
echo.
echo Accede desde cualquier dispositivo en tu red:
echo   - Frontend: http://172.16.7.32:3000
echo   - Backend:  http://172.16.7.32:8000/api
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
