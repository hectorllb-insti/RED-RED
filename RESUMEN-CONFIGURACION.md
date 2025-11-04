# 📦 Sistema de Configuración de Entornos - RED-RED

## ✅ Archivos Creados

### 📁 Backend (backend/)

1. **`.env.example`** - Plantilla completa con todas las variables documentadas
2. **`.env.development`** - Configuración lista para desarrollo local
3. **`.env.production`** - Configuración base para producción (editar antes de usar)

**Variables configurables:**

- Django (SECRET_KEY, DEBUG, ALLOWED_HOSTS)
- Red (LOCAL_IP, PORT)
- Base de datos (MongoDB/SQLite)
- Redis para WebSockets
- CORS
- JWT
- Media/Static files
- Límites de archivos
- Paginación
- Internacionalización
- Seguridad (SSL, HSTS, Cookies)
- Logging

### 📁 Frontend (frontend/)

1. **`.env.example`** - Plantilla completa con todas las variables documentadas
2. **`.env.development`** - Configuración lista para desarrollo local
3. **`.env.production`** - Configuración base para producción

**Variables configurables:**

- API URL
- WebSocket URL
- Environment
- App info (nombre, versión)
- Feature flags (stories, chat, notifications)
- Límites de archivos
- UI config (paginación, auto-refresh)
- Analytics (Google Analytics)
- Error tracking (Sentry)

### 📁 Raíz del Proyecto

1. **`CONFIGURACION.md`** - Guía completa y detallada

   - Explicación de cada variable
   - Configuración paso a paso
   - Acceso en red local
   - Checklist de seguridad
   - Solución de problemas
   - Comandos útiles

2. **`ENV-README.md`** - Guía rápida de inicio

   - Resumen rápido
   - Archivos disponibles
   - Variables importantes
   - Enlaces a documentación

3. **`GUIA-VISUAL-CONFIG.md`** - Guía visual con diagramas

   - Flujos de trabajo visuales
   - Tablas comparativas
   - Checklists
   - Problemas comunes

4. **`cambiar-entorno.bat`** - Script para Windows

   - Menú interactivo
   - Cambio automático entre entornos
   - Verificación de configuración
   - Checklist de seguridad

5. **`cambiar-entorno.sh`** - Script para Linux/Mac
   - Menú interactivo
   - Cambio automático entre entornos
   - Verificación de configuración

## 🔄 Mejoras en settings.py

El archivo `backend/config/settings.py` ahora usa variables de entorno para:

- ✅ JWT (tiempos de vida de tokens)
- ✅ CORS (orígenes permitidos)
- ✅ Paginación (elementos por página)
- ✅ Internacionalización (idioma, zona horaria)
- ✅ Redis/Channels (detección automática)
- ✅ Media/Static (rutas configurables)
- ✅ Seguridad (SSL, HSTS, cookies seguras)
- ✅ Límites de archivos (tamaños máximos, formatos)
- ✅ Logging (nivel, directorio)

## 🎯 Uso Rápido

### Desarrollo

**Opción 1: Script automático**

```bash
# Windows
cambiar-entorno.bat
# Selecciona opción 1

# Linux/Mac
chmod +x cambiar-entorno.sh
./cambiar-entorno.sh
# Selecciona opción 1
```

**Opción 2: Manual**

```bash
# Backend
cd backend
cp .env.development .env
# Edita LOCAL_IP con tu IP

# Frontend
cd frontend
cp .env.development .env.local
# Edita las URLs con tu IP
```

### Producción

```bash
# Backend
cd backend
cp .env.production .env
# ⚠️ EDITAR: SECRET_KEY, ALLOWED_HOSTS, CORS, etc.

# Frontend
# Configura variables en tu servicio de hosting
```

## 📊 Variables Más Importantes

### Backend

- `SECRET_KEY` - Clave secreta (⚠️ cambiar en producción)
- `DEBUG` - Modo debug (⚠️ False en producción)
- `ALLOWED_HOSTS` - Hosts permitidos
- `LOCAL_IP` - Tu IP de red local
- `CORS_ALLOWED_ORIGINS` - URLs del frontend
- `REDIS_URL` - Redis para WebSockets (producción)

### Frontend

- `REACT_APP_API_URL` - URL de la API
- `REACT_APP_WS_URL` - URL para WebSockets

## 🔒 Seguridad

✅ Archivos `.env` ya están en `.gitignore`
✅ Variables sensibles no están hardcodeadas
✅ Configuraciones de producción separadas
✅ Documentación de seguridad incluida

## 📚 Documentación

1. **Inicio rápido:** `ENV-README.md`
2. **Guía completa:** `CONFIGURACION.md`
3. **Guía visual:** `GUIA-VISUAL-CONFIG.md`

## 🛠️ Scripts Disponibles

- `cambiar-entorno.bat` (Windows)
- `cambiar-entorno.sh` (Linux/Mac)

Ambos incluyen:

- Cambio automático de entorno
- Verificación de configuración actual
- Checklist de seguridad

## ✨ Características

✅ Configuración centralizada
✅ Fácil cambio entre entornos
✅ Documentación completa
✅ Scripts de ayuda
✅ Valores por defecto seguros
✅ Soporte para red local
✅ Preparado para producción

## 📝 Próximos Pasos

1. **Desarrollo local:**

   - Ejecuta `cambiar-entorno.bat` o `cambiar-entorno.sh`
   - Selecciona opción 1 (Desarrollo)
   - Edita la IP local si es necesario
   - Inicia los servidores

2. **Acceso en red local:**

   - Lee la sección "Configuración para Acceso en Red Local" en `CONFIGURACION.md`

3. **Producción:**
   - Lee el "Checklist de Seguridad para Producción" en `CONFIGURACION.md`
   - Edita `.env.production` con valores seguros
   - Configura Redis para WebSockets
   - Configura base de datos de producción

## 🆘 Soporte

Si tienes problemas:

1. Ejecuta el script con opción 3 para ver configuración actual
2. Consulta "Solución de Problemas" en `CONFIGURACION.md`
3. Revisa "Problemas Comunes" en `GUIA-VISUAL-CONFIG.md`

---

**Autor:** Sistema de Configuración Automatizado
**Versión:** 1.0.0
**Fecha:** Noviembre 2025
