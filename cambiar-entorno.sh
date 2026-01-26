#!/bin/bash
# ====================================
# Script para cambiar entre entornos
# RED-RED Project
# ====================================

echo ""
echo "===================================="
echo "   RED-RED - Selector de Entorno"
echo "===================================="
echo ""
echo "Selecciona el entorno a configurar:"
echo ""
echo "1. Desarrollo (Local)"
echo "2. Producción"
echo "3. Mostrar configuración actual"
echo "4. Salir"
echo ""

read -p "Tu elección (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Configurando entorno de DESARROLLO..."
        echo ""
        
        # Backend
        if [ -f backend/.env.development ]; then
            cp backend/.env.development backend/.env
            echo "[OK] Backend configurado para desarrollo"
        else
            echo "[ERROR] No se encontró backend/.env.development"
        fi
        
        # Frontend
        if [ -f frontend/.env.development ]; then
            cp frontend/.env.development frontend/.env.local
            echo "[OK] Frontend configurado para desarrollo"
        else
            echo "[ERROR] No se encontró frontend/.env.development"
        fi
        
        echo ""
        echo "===================================="
        echo " Entorno de DESARROLLO configurado"
        echo "===================================="
        echo ""
        echo "Puedes iniciar los servidores con:"
        echo "  Backend:  cd backend && python manage.py runserver 0.0.0.0:8000"
        echo "  Frontend: cd frontend && npm start"
        echo ""
        ;;
        
    2)
        echo ""
        echo "Configurando entorno de PRODUCCIÓN..."
        echo ""
        echo "ATENCIÓN: Asegúrate de haber editado los archivos .env.production"
        echo "con valores seguros antes de continuar."
        echo ""
        read -p "¿Continuar? (s/N): " confirm
        
        if [[ ! $confirm =~ ^[Ss]$ ]]; then
            echo "Operación cancelada"
            exit 0
        fi
        
        # Backend
        if [ -f backend/.env.production ]; then
            cp backend/.env.production backend/.env
            echo "[OK] Backend configurado para producción"
        else
            echo "[ERROR] No se encontró backend/.env.production"
        fi
        
        echo "[INFO] Para producción, configura las variables en tu servicio de hosting"
        echo "       No copies archivos .env al frontend en producción"
        
        echo ""
        echo "===================================="
        echo " Entorno de PRODUCCIÓN configurado"
        echo "===================================="
        echo ""
        echo "CHECKLIST DE SEGURIDAD:"
        echo "[ ] SECRET_KEY cambiada"
        echo "[ ] DEBUG=False"
        echo "[ ] ALLOWED_HOSTS configurado"
        echo "[ ] CORS_ALLOWED_ORIGINS configurado"
        echo "[ ] Redis configurado"
        echo "[ ] Base de datos de producción lista"
        echo ""
        ;;
        
    3)
        echo ""
        echo "===================================="
        echo "   Configuración Actual"
        echo "===================================="
        echo ""
        
        echo "--- BACKEND ---"
        if [ -f backend/.env ]; then
            echo "Archivo: backend/.env encontrado"
            grep "DEBUG=" backend/.env 2>/dev/null || echo "DEBUG no encontrado"
            grep "ALLOWED_HOSTS=" backend/.env 2>/dev/null || echo "ALLOWED_HOSTS no encontrado"
            grep "LOCAL_IP=" backend/.env 2>/dev/null || echo "LOCAL_IP no encontrado"
        else
            echo "[WARNING] No existe backend/.env"
        fi
        
        echo ""
        echo "--- FRONTEND ---"
        if [ -f frontend/.env.local ]; then
            echo "Archivo: frontend/.env.local encontrado"
            grep "REACT_APP_API_URL=" frontend/.env.local 2>/dev/null
            grep "REACT_APP_WS_URL=" frontend/.env.local 2>/dev/null
            grep "NODE_ENV=" frontend/.env.local 2>/dev/null
        else
            echo "[WARNING] No existe frontend/.env.local"
        fi
        
        echo ""
        echo "Para más detalles, abre los archivos .env directamente"
        echo ""
        ;;
        
    4)
        echo "Saliendo..."
        exit 0
        ;;
        
    *)
        echo "Opción inválida"
        exit 1
        ;;
esac
