# 🔧 Archivos de Configuración de Entorno

## 📋 Resumen Rápido

Este proyecto usa archivos `.env` para configurar diferentes entornos (desarrollo, producción).

### 🚀 Inicio Rápido

#### Opción 1: Script Automático (Recomendado)

```bash
# Windows
cambiar-entorno.bat

# Linux/Mac
chmod +x cambiar-entorno.sh
./cambiar-entorno.sh
```

#### Opción 2: Manual

**Desarrollo:**

```bash
# Backend
cd backend
cp .env.development .env

# Frontend
cd frontend
cp .env.development .env.local
```

**Producción:**

```bash
# Backend
cd backend
cp .env.production .env
# ⚠️ Edita .env y cambia valores sensibles

# Frontend
# Configura las variables en tu servicio de hosting
```

## 📁 Archivos Disponibles

### Backend (`backend/`)

- `.env.example` - Plantilla con todas las variables documentadas
- `.env.development` - Configuración para desarrollo local
- `.env.production` - Configuración para producción (editar antes de usar)
- `.env` - Archivo activo (gitignored)

### Frontend (`frontend/`)

- `.env.example` - Plantilla con todas las variables documentadas
- `.env.development` - Configuración para desarrollo local
- `.env.production` - Configuración para producción
- `.env.local` - Archivo activo para desarrollo (gitignored)

## 🔑 Variables Más Importantes

### Backend

- `DEBUG` - Modo debug (True en desarrollo, False en producción)
- `SECRET_KEY` - Clave secreta (CAMBIAR en producción)
- `ALLOWED_HOSTS` - Hosts permitidos
- `LOCAL_IP` - Tu IP de red local
- `CORS_ALLOWED_ORIGINS` - URLs permitidas del frontend

### Frontend

- `REACT_APP_API_URL` - URL de la API backend
- `REACT_APP_WS_URL` - URL para WebSockets

## 📚 Documentación Completa

Lee [CONFIGURACION.md](./CONFIGURACION.md) para:

- Explicación detallada de cada variable
- Configuración para acceso en red local
- Checklist de seguridad para producción
- Solución de problemas comunes

## ⚠️ Importante

1. **NUNCA** subas archivos `.env` al repositorio
2. En **producción**, cambia `SECRET_KEY`, `DEBUG=False`, y todas las URLs
3. Los archivos `.env.example` son plantillas seguras para compartir

## 🆘 Ayuda

Si tienes problemas:

1. Verifica que tengas el archivo `.env` correcto
2. Revisa que las URLs en frontend apunten al backend
3. Consulta [CONFIGURACION.md](./CONFIGURACION.md)
4. Ejecuta `cambiar-entorno.bat` opción 3 para ver configuración actual

---

**Versión:** 1.0.0 | **Última actualización:** Noviembre 2025
