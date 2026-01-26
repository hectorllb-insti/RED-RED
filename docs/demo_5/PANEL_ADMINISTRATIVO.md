# 🛡️ Panel Administrativo - RED-RED

> **Sistema completo de administración y moderación para RED-RED**

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Dashboard Principal](#dashboard-principal)
- [Gestión de Usuarios](#gestión-de-usuarios)
- [Moderación de Contenido](#moderación-de-contenido)
- [Configuración del Sitio](#configuración-del-sitio)
- [Logs y Auditoría](#logs-y-auditoría)
- [Permisos y Roles](#permisos-y-roles)

---

## 🎯 Visión General

El panel administrativo es una interfaz centralizada que permite a los administradores y moderadores gestionar todos los aspectos de la plataforma RED-RED.

```mermaid
graph TB
    A[🛡️ Panel Admin] --> B[📊 Dashboard]
    A --> C[👥 Usuarios]
    A --> D[📝 Contenido]
    A --> E[⚙️ Configuración]
    A --> F[📋 Logs]
    
    B --> B1[Estadísticas]
    B --> B2[Actividad Reciente]
    
    C --> C1[Lista Usuarios]
    C --> C2[Ban/Unban]
    C --> C3[Roles]
    
    D --> D1[Posts]
    D --> D2[Comentarios]
    D --> D3[Reports]
    
    E --> E1[Sitio]
    E --> E2[Permisos]
    E --> E3[Features]
    
    F --> F1[Acciones Admin]
    F --> F2[Login Attempts]
    F --> F3[Cambios Sistema]
    
    style A fill:#e74c3c
    style B fill:#3498db
    style C fill:#9b59b6
    style D fill:#f39c12
    style E fill:#1abc9c
    style F fill:#95a5a6
```

### Roles Administrativos:

| Rol | Nivel | Permisos |
|-----|-------|----------|
| Super Admin | 🔴 Máximo | Acceso total al sistema |
| Admin | 🟠 Alto | Gestión usuarios y contenido |
| Moderador | 🟡 Medio | Moderación de contenido |
| Support | 🟢 Básico | Ver reportes y responder |

---

## 📊 Dashboard Principal

### Visión General del Sistema:

```mermaid
graph LR
    A[Dashboard] --> B[Métricas Clave]
    A --> C[Gráficos]
    A --> D[Acciones Rápidas]
    
    B --> B1[👥 Total Usuarios]
    B --> B2[📝 Total Posts]
    B --> B3[💬 Comentarios]
    B --> B4[🎥 Streams Activos]
    B --> B5[🚫 Usuarios Baneados]
    
    C --> C1[Registros/día]
    C --> C2[Posts/día]
    C --> C3[Uso de features]
    
    D --> D1[Ban Usuario]
    D --> D2[Ver Reportes]
    D --> D3[Cleanup DB]
```

### Cards de Estadísticas:

```mermaid
graph TD
    subgraph Usuarios
        A1[Usuarios Activos<br/>Hoy: 145]
        A2[Nuevos<br/>Esta semana: 23]
        A3[Baneados<br/>Total: 7]
    end
    
    subgraph Contenido
        B1[Posts Publicados<br/>Hoy: 234]
        B2[Comentarios<br/>Hoy: 456]
        B3[Historias<br/>Activas: 89]
    end
    
    subgraph Streaming
        C1[Streams Activos<br/>Ahora: 3]
        C2[Viewers Total<br/>Ahora: 42]
        C3[Streams Hoy<br/>Total: 18]
    end
```

### Gráficas de Actividad:

**Gráfica de Usuarios (Últimos 7 días):**
- Línea temporal de registros diarios
- Comparación con semana anterior
- Picos de actividad marcados

**Gráfica de Contenido:**
- Posts por día
- Comentarios por día
- Stories creadas por día

**Mapa de Calor:**
- Actividad por hora del día
- Días más activos de la semana
- Features más usadas

---

## 👥 Gestión de Usuarios

### Panel de Usuarios:

```mermaid
graph TD
    A[Lista Usuarios] --> B[Filtros]
    A --> C[Búsqueda]
    A --> D[Acciones]
    
    B --> B1[Todos]
    B --> B2[Activos]
    B --> B3[Baneados]
    B --> B4[Staff]
    B --> B5[Por Rol]
    
    C --> C1[Por Username]
    C --> C2[Por Email]
    C --> C3[Por ID]
    
    D --> D1[Ver Perfil]
    D --> D2[Ban/Unban]
    D --> D3[Cambiar Rol]
    D --> D4[Ver Actividad]
    D --> D5[Reset Password]
```

### Información de Usuario:

**Card de Usuario incluye:**

```mermaid
graph LR
    A[Usuario Card] --> B[Datos Básicos]
    A --> C[Estadísticas]
    A --> D[Acciones]
    
    B --> B1[Avatar]
    B --> B2[Username]
    B --> B3[Email]
    B --> B4[Fecha Registro]
    B --> B5[Estado]
    
    C --> C1[Posts: 45]
    C --> C2[Seguidores: 234]
    C --> C3[Seguidos: 178]
    C --> C4[Puntos: 1250]
    
    D --> D1[Botón Ban]
    D --> D2[Botón Editar Rol]
    D --> D3[Botón Ver Perfil]
```

### Sistema de Baneos:

```mermaid
sequenceDiagram
    participant Admin
    participant Sistema
    participant Usuario
    
    Admin->>Sistema: Click "Ban Usuario"
    Sistema->>Sistema: Mostrar modal razón
    Admin->>Sistema: Escribir razón + confirmar
    
    Sistema->>Sistema: user.is_banned = True
    Sistema->>Sistema: Guardar razón + fecha
    Sistema->>Sistema: Guardar admin_id
    
    Sistema->>Usuario: Cerrar sesiones activas
    Sistema->>Usuario: Bloquear login
    Sistema->>Admin: "Usuario baneado"
    
    Note over Usuario: No puede hacer login
    Note over Usuario: No puede crear contenido
    Note over Usuario: Perfil oculto
```

### Desbanear Usuario:

```mermaid
sequenceDiagram
    participant Admin
    participant Sistema
    participant Usuario
    
    Admin->>Sistema: Click "Unban"
    Sistema->>Sistema: user.is_banned = False
    Sistema->>Sistema: Limpiar razón ban
    Sistema->>Sistema: Log acción de unban
    
    Sistema->>Usuario: Restaurar acceso
    Sistema-->>Admin: "Usuario desbaneado"
    
    Note over Usuario: Puede hacer login
    Note over Usuario: Recupera permisos
```

### Gestión de Roles:

```mermaid
graph TD
    A[Cambiar Rol] --> B{Rol Destino}
    
    B -->|Usuario| C[Permisos Básicos]
    B -->|Moderador| D[+ Moderar Contenido]
    B -->|Admin| E[+ Gestión Usuarios]
    B -->|SuperAdmin| F[+ Config Sistema]
    
    C --> G[Guardar en DB]
    D --> G
    E --> G
    F --> G
    
    G --> H[Log de cambio]
    H --> I[Notificar usuario]
```

**Matriz de Permisos por Rol:**

| Acción | Usuario | Moderador | Admin | Super Admin |
|--------|---------|-----------|-------|-------------|
| Crear contenido | ✅ | ✅ | ✅ | ✅ |
| Eliminar propio contenido | ✅ | ✅ | ✅ | ✅ |
| Eliminar contenido ajeno | ❌ | ✅ | ✅ | ✅ |
| Ver reportes | ❌ | ✅ | ✅ | ✅ |
| Banear usuarios | ❌ | ❌ | ✅ | ✅ |
| Cambiar roles | ❌ | ❌ | ❌ | ✅ |
| Acceder panel admin | ❌ | ✅ | ✅ | ✅ |
| Configurar sitio | ❌ | ❌ | ❌ | ✅ |
| Ver logs sistema | ❌ | ❌ | ✅ | ✅ |

---

## 📝 Moderación de Contenido

### Sistema de Reportes:

```mermaid
graph TB
    A[Usuario Reporta] --> B[Crear Reporte]
    B --> C[Queue Moderación]
    
    C --> D[Moderador Revisa]
    
    D --> E{Acción}
    
    E -->|Aprobar| F[Mantener Contenido]
    E -->|Eliminar| G[Borrar Contenido]
    E -->|Advertir| H[Mensaje Usuario]
    E -->|Ban| I[Banear Usuario]
    
    F --> J[Cerrar Reporte]
    G --> J
    H --> J
    I --> J
    
    J --> K[Log Acción]
```

### Dashboard de Moderación:

```mermaid
graph LR
    A[Panel Moderación] --> B[📋 Reportes]
    A --> C[📝 Posts]
    A --> D[💬 Comentarios]
    A --> E[👤 Perfiles]
    
    B --> B1[Pendientes: 12]
    B --> B2[En revisión: 3]
    B --> B3[Resueltos: 234]
    
    C --> C1[Filtrar por usuario]
    C --> C2[Ordenar por fecha]
    C --> C3[Buscar texto]
    
    D --> D1[Spam detectado: 5]
    D --> D2[Palabras prohibidas: 2]
```

### Tipos de Reportes:

| Tipo | Descripción | Acción Típica |
|------|-------------|---------------|
| Spam | Contenido repetitivo | Eliminar + advertencia |
| Acoso | Ataques personales | Ban temporal/permanente |
| Contenido Inapropiado | Violación normas | Eliminar contenido |
| Información Falsa | Desinformación | Review manual |
| Copyright | Violación derechos | Eliminar + notificar |
| Suplantación | Fake account | Ban permanente |

### Flujo de Revisión:

```mermaid
stateDiagram-v2
    [*] --> Reportado
    Reportado --> EnRevisión: Moderador asigna
    
    EnRevisión --> Aprobado: Sin violación
    EnRevisión --> EliminadoContenido: Viola normas leves
    EnRevisión --> AdvertenciaUsuario: Primera infracción
    EnRevisión --> BanTemporal: Reincidente
    EnRevisión --> BanPermanente: Grave/repetido
    
    Aprobado --> [*]
    EliminadoContenido --> [*]
    AdvertenciaUsuario --> [*]
    BanTemporal --> [*]
    BanPermanente --> [*]
```

### Panel de Moderación Rápida:

**Vista de Reporte:**
- Contenido reportado
- Usuario reportado
- Razón del reporte
- Histórico del usuario
- Reportes previos

**Acciones Disponibles:**
- ✅ Aprobar (no viola normas)
- 🗑️ Eliminar contenido
- ⚠️ Advertir usuario
- 🔇 Silenciar temporalmente
- 🚫 Ban temporal (7/30 días)
- 🔴 Ban permanente

---

## ⚙️ Configuración del Sitio

### Panel de Configuración:

```mermaid
graph TD
    A[Configuración] --> B[General]
    A --> C[Features]
    A --> D[Límites]
    A --> E[Seguridad]
    
    B --> B1[Nombre Sitio]
    B --> B2[Logo]
    B --> B3[Descripción]
    B --> B4[Contacto]
    
    C --> C1[Habilitar Streaming]
    C --> C2[Habilitar Stories]
    C --> C3[Habilitar Ruleta]
    C --> C4[Habilitar Chat]
    
    D --> D1[Max Posts/día]
    D --> D2[Max Seguidores]
    D --> D3[Tamaño Archivos]
    D --> D4[Duración Streams]
    
    E --> E1[2FA Obligatorio]
    E --> E2[Verificar Email]
    E --> E3[Min Password Length]
    E --> E4[Rate Limiting]
```

### Configuraciones Principales:

#### **Features Toggles:**

| Feature | Estado | Descripción |
|---------|--------|-------------|
| 🎥 Streaming | ON/OFF | Habilitar sistema de live streaming |
| 📖 Stories | ON/OFF | Habilitar historias temporales |
| 🎰 Ruleta | ON/OFF | Sistema de recompensas |
| 💬 Chat | ON/OFF | Chat en tiempo real |
| 🔔 Notificaciones | ON/OFF | Push notifications |
| 🌙 Modo Oscuro | ON/OFF | Tema oscuro por defecto |

#### **Límites del Sistema:**

```mermaid
graph LR
    A[Límites] --> B[Por Usuario]
    A --> C[Por Contenido]
    A --> D[Por Sesión]
    
    B --> B1[Posts/día: 10]
    B --> B2[Stories/día: 5]
    B --> B3[Follows/día: 50]
    B --> B4[Messages/min: 30]
    
    C --> C1[Imagen: 5MB]
    C --> C2[Video: 50MB]
    C --> C3[Caption: 500 chars]
    C --> C4[Comment: 200 chars]
    
    D --> D1[Requests/min: 60]
    D --> D2[Logins/hora: 5]
    D --> D3[Stream/día: 3]
```

#### **Configuración de Seguridad:**

- **Autenticación:**
  - Longitud mínima contraseña: 8 caracteres
  - Requerir mayúsculas/números: Sí/No
  - 2FA obligatorio: Sí/No
  - Expiración token JWT: 24 horas

- **Rate Limiting:**
  - Requests por minuto: 60
  - Login attempts: 5 intentos/hora
  - API calls: 100/hora

- **Moderación Automática:**
  - Filtro de palabras prohibidas: ON/OFF
  - Detección de spam: ON/OFF
  - Auto-ban tras X reportes: 5 reportes

---

## 📋 Logs y Auditoría

### Sistema de Logging:

```mermaid
graph TD
    A[Acciones Sistema] --> B[Logger]
    
    B --> C[Login Logs]
    B --> D[Admin Actions]
    B --> E[Content Changes]
    B --> F[System Events]
    
    C --> C1[Fecha/Hora]
    C --> C2[Usuario]
    C --> C3[IP]
    C --> C4[Resultado]
    
    D --> D1[Admin User]
    D --> D2[Acción]
    D --> D3[Target]
    D --> D4[Cambios]
    
    E --> E1[Tipo Contenido]
    E --> E2[Acción]
    E --> E3[Usuario]
    
    F --> F1[Tipo Evento]
    F --> F2[Severidad]
    F --> F3[Detalles]
```

### Tipos de Logs:

#### **1. Login Attempts:**

```mermaid
graph LR
    A[Login Log] --> B[Exitoso]
    A --> C[Fallido]
    
    B --> B1[Usuario]
    B --> B2[Timestamp]
    B --> B3[IP]
    B --> B4[Device]
    
    C --> C1[Username intentado]
    C --> C2[IP]
    C --> C3[Razón fallo]
    C --> C4[# Intento]
```

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Timestamp | Fecha y hora | 2024-01-15 14:30:22 |
| Usuario | Username | @usuario123 |
| IP | Dirección IP | 192.168.1.100 |
| Estado | Éxito/Fallo | ✅ Exitoso |
| Device | User agent | Chrome/Windows |

#### **2. Admin Actions:**

Registra todas las acciones administrativas:

| Acción | Admin | Target | Timestamp | Detalles |
|--------|-------|--------|-----------|----------|
| Ban Usuario | @admin1 | @usuario5 | 10:30 AM | Razón: Spam |
| Cambiar Rol | @admin1 | @user2 | 11:45 AM | User → Moderador |
| Eliminar Post | @mod1 | Post #123 | 12:15 PM | Violación normas |
| Cambiar Config | @superadmin | Site | 14:00 PM | Max posts/día: 10→15 |

#### **3. Content Moderation:**

```mermaid
sequenceDiagram
    participant C as Contenido
    participant M as Moderador
    participant L as Log System
    participant DB as Database
    
    M->>C: Revisar contenido
    M->>C: Tomar acción
    C->>L: Log acción
    L->>DB: Guardar log
    
    Note over L: Registra:<br/>- Qué se hizo<br/>- Quién lo hizo<br/>- Cuándo<br/>- Por qué
```

#### **4. System Events:**

```mermaid
graph TD
    A[System Events] --> B[Errores]
    A --> C[Warnings]
    A --> D[Info]
    
    B --> B1[500 Errors]
    B --> B2[DB Connection]
    B --> B3[WebSocket Fails]
    
    C --> C1[Rate Limit Hit]
    C --> C2[Low Disk Space]
    C --> C3[High Load]
    
    D --> D1[Deployments]
    D --> D2[Backups]
    D --> D3[Maintenance]
```

### Búsqueda y Filtrado de Logs:

**Filtros Disponibles:**
- Por rango de fechas
- Por tipo de acción
- Por usuario (actor o target)
- Por nivel de severidad
- Por resultado (success/fail)

**Exportación:**
- CSV para análisis
- JSON para integración
- PDF para reportes

---

## 🔐 Permisos y Roles

### Jerarquía de Roles:

```mermaid
graph TD
    A[Super Admin] --> B[Admin]
    B --> C[Moderador]
    C --> D[Support]
    D --> E[Usuario Premium]
    E --> F[Usuario Normal]
    
    style A fill:#e74c3c
    style B fill:#e67e22
    style C fill:#f39c12
    style D fill:#3498db
    style E fill:#9b59b6
    style F fill:#95a5a6
```

### Permisos Detallados:

#### **Super Admin:**
- ✅ Acceso total al panel
- ✅ Crear/editar/eliminar administradores
- ✅ Cambiar configuración del sitio
- ✅ Ver todos los logs
- ✅ Acceso a base de datos
- ✅ Deploy y mantenimiento
- ✅ Eliminar cualquier contenido
- ✅ Ban/unban usuarios

#### **Admin:**
- ✅ Gestionar usuarios (no otros admins)
- ✅ Ver logs de usuarios
- ✅ Moderar contenido
- ✅ Gestionar reportes
- ✅ Ver estadísticas
- ✅ Ban/unban usuarios normales
- ❌ Cambiar config sistema
- ❌ Modificar otros admins

#### **Moderador:**
- ✅ Revisar reportes
- ✅ Eliminar contenido inapropiado
- ✅ Advertir usuarios
- ✅ Ver logs de moderación
- ❌ Ban permanente
- ❌ Cambiar roles
- ❌ Acceso a configuración

#### **Support:**
- ✅ Ver reportes
- ✅ Responder tickets
- ✅ Ver perfil usuarios
- ❌ Eliminar contenido
- ❌ Ban usuarios
- ❌ Cambiar configuración

### Sistema de Asignación de Roles:

```mermaid
sequenceDiagram
    participant SA as Super Admin
    participant Sys as Sistema
    participant U as Usuario
    
    SA->>Sys: Seleccionar usuario
    SA->>Sys: Elegir rol
    SA->>Sys: Confirmar cambio
    
    Sys->>Sys: Validar permisos SA
    Sys->>Sys: Actualizar user.role
    Sys->>Sys: Log cambio
    
    Sys->>U: Notificar nuevo rol
    Sys-->>SA: "Rol actualizado"
    
    Note over U: Permisos actualizados
```

### Auditoría de Permisos:

El sistema registra todos los cambios de roles:

| Timestamp | Admin | Usuario Target | Rol Anterior | Rol Nuevo | Razón |
|-----------|-------|----------------|--------------|-----------|-------|
| 10:30 | @superadmin | @user123 | Usuario | Moderador | Confiable |
| 11:45 | @superadmin | @mod456 | Moderador | Admin | Promoción |
| 14:20 | @superadmin | @admin789 | Admin | Usuario | Abuso poder |

---

## 📊 Reportes y Analíticas

### Dashboard de Analíticas:

```mermaid
graph TB
    A[Analíticas] --> B[Usuarios]
    A --> C[Contenido]
    A --> D[Engagement]
    A --> E[Performance]
    
    B --> B1[Nuevos registros]
    B --> B2[Usuarios activos]
    B --> B3[Retención]
    
    C --> C1[Posts creados]
    C --> C2[Contenido eliminado]
    C --> C3[Reportes]
    
    D --> D1[Likes totales]
    D --> D2[Comentarios]
    D --> D3[Shares]
    
    E --> E1[Tiempo carga]
    E --> E2[Errores]
    E --> E3[Uptime]
```

### Métricas Clave (KPIs):

```mermaid
graph LR
    A[KPIs] --> B[DAU/MAU]
    A --> C[Engagement Rate]
    A --> D[Content/User]
    A --> E[Report Rate]
    
    B --> B1[45%]
    C --> C1[3.2/día]
    D --> D1[8 posts/user]
    E --> E1[0.5%]
```

### Reportes Automáticos:

- **Reporte Diario**: Enviado a admins cada mañana
  - Nuevos usuarios
  - Posts creados
  - Reportes abiertos
  - Streams realizados

- **Reporte Semanal**: Resumen de actividad
  - Crecimiento usuarios
  - Engagement metrics
  - Top posts
  - Problemas detectados

- **Reporte Mensual**: Análisis profundo
  - Trends y patrones
  - Comparación con mes anterior
  - Predicciones
  - Recomendaciones

---

## 🚀 Acciones Rápidas

### Herramientas de Administración:

```mermaid
graph TD
    A[Quick Actions] --> B[🧹 Cleanup]
    A --> C[🔄 Maintenance]
    A --> D[📤 Bulk Actions]
    
    B --> B1[Limpiar streams viejos]
    B --> B2[Eliminar logs antiguos]
    B --> B3[Purgar cache]
    
    C --> C1[Reiniciar WebSocket]
    C --> C2[Rebuild index]
    C --> C3[Check DB health]
    
    D --> D1[Ban múltiples users]
    D --> D2[Eliminar posts en masa]
    D --> D3[Enviar notificaciones]
```

### Scripts de Mantenimiento:

#### **Cleanup Streams:**
- Elimina streams finalizados hace más de 24h
- Limpia archivos temporales de streaming
- Actualiza estadísticas

#### **Database Optimization:**
- Vacuum database
- Reindex tablas
- Analizar queries lentas

#### **Backup Automático:**
- Backup diario de base de datos
- Backup semanal de media files
- Retention policy: 30 días

---

## ✅ Checklist de Funcionalidades

- [x] ✅ Dashboard con estadísticas en tiempo real
- [x] ✅ Lista completa de usuarios con filtros
- [x] ✅ Sistema de ban/unban con razones
- [x] ✅ Gestión de roles y permisos
- [x] ✅ Panel de moderación de contenido
- [x] ✅ Sistema de reportes
- [x] ✅ Configuración del sitio
- [x] ✅ Logs de todas las acciones
- [x] ✅ Auditoría completa
- [x] ✅ Búsqueda y filtrado avanzado
- [x] ✅ Acciones rápidas
- [x] ✅ Reportes automáticos
- [x] ✅ Interfaz responsive
- [x] ✅ Protección de rutas (solo admins)

---

## 🎯 Mejores Prácticas

### Para Administradores:

1. **Revisar logs diariamente** para detectar problemas
2. **Responder reportes** en menos de 24 horas
3. **Documentar razones** de bans y acciones importantes
4. **Mantener comunicación** con el equipo de moderación
5. **Backup regular** de datos críticos

### Para Moderadores:

1. **Ser consistente** en decisiones de moderación
2. **Revisar contexto** antes de tomar acción
3. **Advertir antes de banear** (primera infracción leve)
4. **Documentar evidencia** en reportes
5. **Comunicar políticas** claramente

---

## 🔄 Roadmap Futuro

```mermaid
timeline
    title Mejoras Panel Admin
    Actual : Dashboard básico
         : Gestión usuarios
         : Sistema reportes
    Fase 2 : Analytics avanzados
          : Machine learning anti-spam
          : Auto-moderación mejorada
    Fase 3 : Sistema de tickets
          : Chat con usuarios
          : Automated reports
          : A/B testing tools
```

---

## 🎉 Resultado Final

Un panel administrativo completo con:
- 📊 **Dashboard** informativo y en tiempo real
- 👥 **Gestión de usuarios** eficiente con sistema de roles
- 🛡️ **Moderación** de contenido con múltiples herramientas
- ⚙️ **Configuración** flexible del sitio
- 📋 **Auditoría completa** de todas las acciones
- 🚀 **Herramientas** de mantenimiento y optimización

**¡Control total sobre RED-RED!** 🛡️

---