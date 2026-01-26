# 🌐 Configuración de Acceso en Red Local

## 📌 Información de Red

**IP Local del Servidor:** `172.16.7.32`

Tu aplicación RED-RED ahora está configurada para ser accesible desde cualquier dispositivo en tu red local.

---

## 🚀 Cómo Iniciar la Aplicación

### 1️⃣ Backend (Django)

```powershell
cd backend
python manage.py runserver 0.0.0.0:8000
```

Esto permite que el backend escuche en todas las interfaces de red.

### 2️⃣ Frontend (React)

```powershell
cd frontend
npm start
```

El frontend ahora escuchará en `0.0.0.0:3000` y usará la IP `172.16.7.32` para conectarse al backend.

---

## 🔗 URLs de Acceso

### Desde tu PC (localhost):

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Admin Django:** http://localhost:8000/admin

### Desde otros dispositivos en la red local:

- **Frontend:** http://172.16.7.32:3000
- **Backend API:** http://172.16.7.32:8000/api
- **Admin Django:** http://172.16.7.32:8000/admin

---

## ⚙️ Configuraciones Aplicadas

### Backend (Django)

#### `backend/config/settings.py`:

```python
# Hosts permitidos
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '172.16.7.32', '0.0.0.0']

# CORS - Orígenes permitidos
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://172.16.7.32:3000",
]

# Permitir credenciales (cookies, headers de auth)
CORS_ALLOW_CREDENTIALS = True
```

### Frontend (React)

#### `frontend/.env`:

```env
REACT_APP_API_URL=http://172.16.7.32:8000/api
REACT_APP_WS_URL=ws://172.16.7.32:8000
NODE_ENV=development
```

#### `frontend/package.json`:

```json
"scripts": {
  "start": "set HOST=0.0.0.0&& react-scripts start"
}
```

---

## 📱 Acceso desde Dispositivos Móviles

### Android/iOS en la misma WiFi:

1. Asegúrate de que tu móvil está conectado a la **misma red WiFi**
2. Abre el navegador en tu móvil
3. Navega a: `http://172.16.7.32:3000`

### Requisitos:

- ✅ PC y dispositivo móvil en la misma red WiFi
- ✅ Firewall de Windows permite conexiones (ver sección siguiente)
- ✅ Backend y frontend ejecutándose

---

## 🛡️ Configurar Firewall de Windows

Para permitir conexiones desde otros dispositivos, necesitas configurar el firewall:

### Opción 1: Permitir Python y Node.js

```powershell
# Ejecutar PowerShell como Administrador

# Permitir Python
netsh advfirewall firewall add rule name="Python Server" dir=in action=allow program="C:\Python\python.exe" enable=yes

# Permitir Node.js
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
```

### Opción 2: Permitir puertos específicos

```powershell
# Ejecutar PowerShell como Administrador

# Puerto 8000 (Django Backend)
netsh advfirewall firewall add rule name="Django Backend Port 8000" dir=in action=allow protocol=TCP localport=8000

# Puerto 3000 (React Frontend)
netsh advfirewall firewall add rule name="React Frontend Port 3000" dir=in action=allow protocol=TCP localport=3000
```

### Opción 3: GUI (Interfaz Gráfica)

1. Abre **"Firewall de Windows Defender con seguridad avanzada"**
2. Click en **"Reglas de entrada"** → **"Nueva regla"**
3. Selecciona **"Puerto"** → Siguiente
4. Selecciona **"TCP"** y escribe el puerto (3000 o 8000)
5. Selecciona **"Permitir la conexión"**
6. Aplica a todas las redes
7. Dale un nombre (ej: "RED-RED Frontend")

---

## 🧪 Verificar Configuración

### 1. Verificar que el backend escucha en todas las interfaces:

```powershell
netstat -an | findstr :8000
```

Deberías ver:

```
TCP    0.0.0.0:8000          0.0.0.0:0              LISTENING
```

### 2. Verificar que el frontend escucha en todas las interfaces:

```powershell
netstat -an | findstr :3000
```

Deberías ver:

```
TCP    0.0.0.0:3000          0.0.0.0:0              LISTENING
```

### 3. Probar desde otro dispositivo:

Desde un navegador en otro dispositivo en la red:

```
http://172.16.7.32:3000
```

---

## 🔧 Solución de Problemas

### Problema: No puedo acceder desde otro dispositivo

**Solución:**

1. Verifica que ambos dispositivos están en la misma red WiFi
2. Verifica que el firewall permite las conexiones (ver sección anterior)
3. Asegúrate de que backend y frontend están ejecutándose
4. Prueba hacer ping desde el otro dispositivo:
   ```bash
   ping 172.16.7.32
   ```

### Problema: CORS error en el navegador

**Solución:**

- Verifica que la IP del frontend (`172.16.7.32:3000`) está en `CORS_ALLOWED_ORIGINS` del backend
- Asegúrate de que `CORS_ALLOW_CREDENTIALS = True` está configurado

### Problema: WebSocket no conecta

**Solución:**

- Verifica que `REACT_APP_WS_URL=ws://172.16.7.32:8000` está en el `.env`
- Asegúrate de que Django Channels está ejecutándose correctamente
- Revisa que el firewall permite el puerto 8000

### Problema: La IP cambió

Si tu IP local cambia (conexión a otra red):

1. Ejecuta `ipconfig` para obtener la nueva IP:

   ```powershell
   ipconfig | findstr /i "IPv4"
   ```

2. Actualiza la IP en:

   - `backend/config/settings.py` → `ALLOWED_HOSTS` y `CORS_ALLOWED_ORIGINS`
   - `frontend/.env` → `REACT_APP_API_URL` y `REACT_APP_WS_URL`

3. Reinicia backend y frontend

---

## 📊 Configuración de Producción

⚠️ **IMPORTANTE:** Esta configuración es solo para desarrollo/red local.

Para producción, deberías:

- ✅ Usar un dominio real
- ✅ Configurar HTTPS con certificados SSL
- ✅ Usar un servidor web (Nginx/Apache)
- ✅ Configurar `DEBUG = False`
- ✅ Usar variables de entorno para configuración sensible
- ✅ Implementar rate limiting
- ✅ Configurar headers de seguridad adicionales

---

## 📝 Comandos Útiles

### Ver IP de tu máquina:

```powershell
ipconfig
```

### Ver dispositivos conectados a tu red:

```powershell
arp -a
```

### Ver puertos en uso:

```powershell
netstat -an | findstr LISTENING
```

### Reiniciar servicios:

```powershell
# Detener con Ctrl+C en cada terminal
# Volver a ejecutar:
cd backend
python manage.py runserver 0.0.0.0:8000

cd frontend
npm start
```

---

## ✅ Checklist de Configuración

- [x] Backend configurado con `ALLOWED_HOSTS` correcto
- [x] CORS configurado con orígenes permitidos
- [x] Frontend `.env` con IP correcta
- [x] package.json con `HOST=0.0.0.0`
- [x] Firewall de Windows configurado
- [ ] Backend ejecutándose en `0.0.0.0:8000`
- [ ] Frontend ejecutándose en `0.0.0.0:3000`
- [ ] Probado desde otro dispositivo en la red

---

## 🎉 ¡Listo!

Tu aplicación RED-RED ahora es accesible desde cualquier dispositivo en tu red local.

**Comparte esta URL con otros en tu red WiFi:**

```
http://172.16.7.32:3000
```

---

**Última actualización:** 28 de Octubre, 2025  
**IP Configurada:** 172.16.7.32  
**Puertos:** Frontend (3000), Backend (8000)
