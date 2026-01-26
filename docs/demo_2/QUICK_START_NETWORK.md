# 🚀 Inicio Rápido - Red Local

## ✅ Todo está configurado para acceso en red local!

### 📍 Tu IP Local: `172.16.7.32`

---

## 🎯 Opción 1: Inicio Automático (Recomendado)

Simplemente ejecuta el archivo:

```
start-network.bat
```

Esto iniciará automáticamente:

- ✅ Backend Django en `0.0.0.0:8000`
- ✅ Frontend React en `0.0.0.0:3000`

---

## 🎯 Opción 2: Inicio Manual

### Backend:

```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

### Frontend (en otra terminal):

```bash
cd frontend
npm start
```

---

## 🌐 URLs de Acceso

### Desde tu PC:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000/api

### Desde otros dispositivos en tu red WiFi:

- Frontend: **http://172.16.7.32:3000**
- Backend: **http://172.16.7.32:8000/api**

---

## 📱 Acceso desde Móvil

1. Conecta tu móvil a la **misma WiFi**
2. Abre el navegador
3. Ve a: **http://172.16.7.32:3000**

---

## 🛡️ Configurar Firewall (Si no funciona)

Ejecuta PowerShell **como Administrador**:

```powershell
# Permitir puerto 8000 (Backend)
netsh advfirewall firewall add rule name="Django Port 8000" dir=in action=allow protocol=TCP localport=8000

# Permitir puerto 3000 (Frontend)
netsh advfirewall firewall add rule name="React Port 3000" dir=in action=allow protocol=TCP localport=3000
```

---

## ✅ Verificar que funciona

```powershell
# Ver si los puertos están escuchando
netstat -an | findstr "8000"
netstat -an | findstr "3000"

# Deberías ver: 0.0.0.0:8000 y 0.0.0.0:3000
```

---

## 🔧 Configuraciones Aplicadas

✅ **Backend (`backend/config/settings.py`):**

- `ALLOWED_HOSTS` incluye `172.16.7.32`
- `CORS_ALLOWED_ORIGINS` incluye `http://172.16.7.32:3000`

✅ **Frontend (`frontend/.env`):**

- `REACT_APP_API_URL=http://172.16.7.32:8000/api`
- `REACT_APP_WS_URL=ws://172.16.7.32:8000`

✅ **Frontend (`frontend/package.json`):**

- Script `start` usa `HOST=0.0.0.0`

---

## 📖 Documentación Completa

Para más detalles, consulta: **NETWORK_ACCESS_SETUP.md**

---

## 🎉 ¡Listo para usar!

Comparte esta URL con tus amigos en la misma WiFi:

```
http://172.16.7.32:3000
```
