@echo off
REM ====================================
REM Script para cambiar entre entornos
REM RED-RED Project
REM ====================================

echo.
echo ====================================
echo   RED-RED - Selector de Entorno
echo ====================================
echo.
echo Selecciona el entorno a configurar:
echo.
echo 1. Desarrollo (Local)
echo 2. Produccion
echo 3. Mostrar configuracion actual
echo 4. Salir
echo.

set /p choice="Tu eleccion (1-4): "

if "%choice%"=="1" goto development
if "%choice%"=="2" goto production
if "%choice%"=="3" goto show_config
if "%choice%"=="4" goto end

echo Opcion invalida
goto end

:development
echo.
echo Configurando entorno de DESARROLLO...
echo.

REM Backend
if exist backend\.env.development (
    copy /Y backend\.env.development backend\.env >nul
    echo [OK] Backend configurado para desarrollo
) else (
    echo [ERROR] No se encontro backend\.env.development
)

REM Frontend
if exist frontend\.env.development (
    copy /Y frontend\.env.development frontend\.env.local >nul
    echo [OK] Frontend configurado para desarrollo
) else (
    echo [ERROR] No se encontro frontend\.env.development
)

echo.
echo ====================================
echo  Entorno de DESARROLLO configurado
echo ====================================
echo.
echo Puedes iniciar los servidores con:
echo   Backend:  cd backend ^&^& python manage.py runserver 0.0.0.0:8000
echo   Frontend: cd frontend ^&^& npm start
echo.
goto end

:production
echo.
echo Configurando entorno de PRODUCCION...
echo.
echo ATENCION: Asegurate de haber editado los archivos .env.production
echo con valores seguros antes de continuar.
echo.
set /p confirm="¿Continuar? (S/N): "

if /i not "%confirm%"=="S" (
    echo Operacion cancelada
    goto end
)

REM Backend
if exist backend\.env.production (
    copy /Y backend\.env.production backend\.env >nul
    echo [OK] Backend configurado para produccion
) else (
    echo [ERROR] No se encontro backend\.env.production
)

REM Frontend
echo [INFO] Para produccion, configura las variables en tu servicio de hosting
echo        No copies archivos .env al frontend en produccion

echo.
echo ====================================
echo  Entorno de PRODUCCION configurado
echo ====================================
echo.
echo CHECKLIST DE SEGURIDAD:
echo [ ] SECRET_KEY cambiada
echo [ ] DEBUG=False
echo [ ] ALLOWED_HOSTS configurado
echo [ ] CORS_ALLOWED_ORIGINS configurado
echo [ ] Redis configurado
echo [ ] Base de datos de produccion lista
echo.
goto end

:show_config
echo.
echo ====================================
echo   Configuracion Actual
echo ====================================
echo.

echo --- BACKEND ---
if exist backend\.env (
    echo Archivo: backend\.env encontrado
    findstr /C:"DEBUG=" backend\.env 2>nul
    findstr /C:"ALLOWED_HOSTS=" backend\.env 2>nul
    findstr /C:"LOCAL_IP=" backend\.env 2>nul
) else (
    echo [WARNING] No existe backend\.env
)

echo.
echo --- FRONTEND ---
if exist frontend\.env.local (
    echo Archivo: frontend\.env.local encontrado
    findstr /C:"REACT_APP_API_URL=" frontend\.env.local 2>nul
    findstr /C:"REACT_APP_WS_URL=" frontend\.env.local 2>nul
    findstr /C:"NODE_ENV=" frontend\.env.local 2>nul
) else (
    echo [WARNING] No existe frontend\.env.local
)

echo.
echo Para mas detalles, abre los archivos .env directamente
echo.
goto end

:end
echo.
pause
