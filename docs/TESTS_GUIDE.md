# Guía de Ejecución de Pruebas - RED-RED

Este documento detalla los comandos necesarios para ejecutar todas las pruebas del proyecto, tanto en el Backend como en el Frontend.

## 🐍 Backend (Django)

Antes de ejecutar los comandos, asegúrate de estar en la carpeta `backend/` y de tener el entorno virtual creado.

### 1. Preparación del Entorno
Ejecuta estos comandos para asegurar que existen los directorios necesarios:
```powershell
mkdir -p staticfiles
mkdir -p media
mkdir -p logs
```

### 2. Comandos de Ejecución Directa (Copia y Pega)
Asegúrate de estar en la carpeta `backend/`. Estos comandos usan el entorno virtual directamente:

- **Posts**:
  ```powershell
  .\venv\Scripts\python.exe manage.py test apps.posts.tests
  ```
- **Usuarios (Integración)**:
  ```powershell
  .\venv\Scripts\python.exe manage.py test apps.users.tests
  ```
- **Mocks de Servicios**:
  ```powershell
  .\venv\Scripts\python.exe manage.py test apps.users.test_mocks
  ```
- **Hashtags (Script)**:
  ```powershell
  Get-Content test_hashtags.py | .\venv\Scripts\python.exe manage.py shell
  ```
- **Stream Creation (Script)**:
  ```powershell
  .\venv\Scripts\python.exe test_stream_creation.py
  ```

---

## ⚛️ Frontend (React & Cypress)

Asegúrate de estar en la carpeta `frontend/`.

### 1. Pruebas Unitarias y de Servicios (Jest)
- **App Base**:
  ```bash
  npm test -- src/App.test.js --watchAll=false
  ```
- **Servicios de API (Mocks)**:
  ```bash
  npm test -- src/services/api.test.js --watchAll=false
  ```

### 2. Pruebas End-to-End (Cypress)
- **Ejecutar en consola (Headless)**:
  ```bash
  npm run cypress:run -- --spec cypress/e2e/flow.cy.js
  ```
- **Abrir interfaz de Cypress**:
  ```bash
  npm run cypress:open
  ```

---
*Nota: Si utilizas VS Code, recuerda seleccionar el intérprete de Python dentro de `backend/venv/Scripts/python.exe` para ver los errores en tiempo real en el editor.*
