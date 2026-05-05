# Informe de Implementación de Pruebas (RA5)

Este documento resume la configuración y creación de pruebas para la aplicación RED-RED, cumpliendo con los criterios de evaluación del Resultado de Aprendizaje 5 (Demos 9 y 10).

## 🚀 Resumen de Criterios Cumplidos

### a) Configuración y Estructura
Se ha establecido una infraestructura de pruebas multicanal:
- **Backend**: Integrado con el framework de pruebas de Django.
- **Frontend**: Configurado con **Jest** para pruebas unitarias y **Cypress** para pruebas E2E.

### b) Pruebas Unitarias
- **Frontend**: Archivo `src/App.test.js` para validar el renderizado base.
- **Backend**: Tests de modelos en sus respectivas aplicaciones (Users, Posts).

### c) Pruebas de Integración
- **Backend**: Implementación de tests de API (rest_framework) para validar flujos de usuarios y seguimiento (en `apps/users/tests.py`).

### d) Pruebas E2E (End-to-End)
- Se ha instalado y configurado **Cypress**.
- **Test de flujo**: `frontend/cypress/e2e/flow.cy.js` simula la entrada de un usuario no autenticado, verificando la redirección automática al login y la interactividad del formulario.

### e) y f) Simulación de Comportamientos y Peticiones Externas (Mocks)
Se han implementado simulaciones para no depender de servicios externos reales durante los tests:
- **Frontend (Mocks de API)**: En `src/services/api.test.js` se utiliza `jest.mock` para interceptar llamadas de Axios y simular respuestas del servidor.
- **Backend (Mocks de Servicios)**: En `backend/apps/users/test_mocks.py` se utiliza `@patch` para simular el consumo de una API externa de verificación de Spam via `requests.get`.

### g) Automatización en el Despliegue (CI/CD)
- El archivo `Jenkinsfile` ha sido actualizado para incluir el stage **"Tests - E2E (Cypress)"**, asegurando que la aplicación sea validada integralmente en cada ciclo de integración continua antes del despliegue final.

---

## 🔍 Detalle de los Archivos de Pruebas

A continuación se detalla la función de cada uno de los 5 archivos principales que conforman la infraestructura de pruebas:

### 1. `backend/apps/users/tests.py` (Integración y Modelos)
Este archivo contiene la lógica para validar el backend. Se divide en:
- **Pruebas de API (FollowTestCase)**: Verifica flujos completos como seguir/dejar de seguir usuarios, búsqueda de perfiles y eliminación de cuentas.
- **Pruebas de Modelos (UserModel/FollowModel)**: Asegura que la base de datos se comporte correctamente, validando restricciones de unicidad y métodos de representación de datos.

### 2. `backend/apps/users/test_mocks.py` (Simulación de Servicios)
Utiliza la librería `unittest.mock` para interceptar llamadas externas:
- **Objetivo**: Simular un servicio de detección de Spam.
- **Funcionamiento**: Mediante `@patch`, intercepta las peticiones `requests.get` para devolver respuestas controladas (Éxito, Spam detectado, Error de servidor) sin realizar una conexión real a internet.

### 3. `frontend/src/App.test.js` (Unitaria de Interfaz)
Es la prueba de humo del frontend:
- **Función**: Utiliza `React Testing Library` para renderizar el componente principal `App`.
- **Garantía**: Asegura que la aplicación arranca sin errores críticos y que la estructura base del DOM es correcta antes de profundizar en tests más complejos.

### 4. `frontend/src/services/api.test.js` (Mocks de API Frontend)
Simula la capa de comunicación del cliente:
- **Herramientas**: Utiliza `jest.mock` para suplantar a la librería **Axios**.
- **Acciones**: Emula respuestas exitosas y errores del servidor para las peticiones GET y POST, permitiendo probar la lógica de los servicios sin depender de que el backend esté encendido.

### 5. `frontend/cypress/e2e/flow.cy.js` (E2E - Flujo Completo)
Es la prueba de mayor nivel de integración:
- **Escenario**: Simula a un usuario real abriendo el navegador.
- **Validaciones**: Comprueba la redirección automática a la página de login al intentar acceder a rutas privadas, verifica la presencia de los campos del formulario y valida que los mensajes de error aparezcan al ingresar datos incorrectos.

---

## 🛠️ Cómo ejecutar las pruebas

### Backend
Ubícate en la carpeta `backend/` y ejecuta:
```bash
python manage.py test
```

### Frontend (Unitarias y Mocks)
Ubícate en la carpeta `frontend/` y ejecuta:
```bash
npm test
```

### Frontend (E2E con Cypress)
Ubícate en la carpeta `frontend/` y ejecuta:
```bash
# Modo consola (headless)
npm run cypress:run

# Modo interfaz (browser)
npm run cypress:open
```

---
*Este sistema de pruebas garantiza la estabilidad y calidad del código en RED-RED siguiendo los estándares de la industria.*
