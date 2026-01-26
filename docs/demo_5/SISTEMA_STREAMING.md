# 📹 Sistema de Streaming en Vivo - RED-RED

> **Cómo funciona el sistema de transmisiones en vivo**

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Flujos de Funcionamiento](#flujos-de-funcionamiento)
- [Gestión de Viewers](#gestión-de-viewers)
- [Sistema de Roles](#sistema-de-roles)
- [Chat en Vivo](#chat-en-vivo)

---

## 🎯 Visión General

El sistema de streaming permite a los usuarios transmitir video en tiempo real usando **WebRTC** para la transmisión peer-to-peer y **WebSockets** para la señalización y chat en vivo.

```mermaid
graph TB
    A[👤 Streamer] -->|WebRTC| B[📡 WebSocket Server]
    B -->|Señalización| C[👥 Viewers]
    A -->|Video/Audio| D[WebRTC Peer]
    D -->|Stream directo| C
    B -->|Chat/Comentarios| C
    
    style A fill:#e74c3c
    style B fill:#3498db
    style C fill:#2ecc71
    style D fill:#f39c12
```

### Tecnologías Clave:

- 🔌 **Django Channels**: Gestión de WebSocket para señalización
- 📡 **WebRTC**: Transmisión de video/audio peer-to-peer
- 🎥 **MediaStream API**: Captura de cámara y micrófono
- 💬 **Real-time Chat**: Comentarios en tiempo real
- 👥 **Live Viewers**: Contador actualizado en vivo

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales:

```mermaid
graph TD
    subgraph Frontend
        A[React Component]
        B[WebRTC Handler]
        C[WebSocket Client]
    end
    
    subgraph Backend
        D[Django Channels]
        E[LiveStreamConsumer]
        F[LiveStream Model]
        G[LiveStreamComment Model]
    end
    
    subgraph Database
        H[(SQLite)]
    end
    
    A --> B
    A --> C
    C <--> D
    D --> E
    E <--> F
    E <--> G
    F --> H
    G --> H
```

### Modelos de Datos:

#### 1. **LiveStream**

Almacena información sobre cada transmisión:

- **streamer**: Usuario que transmite
- **title**: Título del stream
- **description**: Descripción opcional
- **status**: Estado actual (waiting, live, ended)
- **started_at**: Momento de inicio
- **ended_at**: Momento de finalización
- **viewers_count**: Número actual de espectadores
- **peak_viewers**: Pico máximo de viewers

**Estados posibles:**

```mermaid
stateDiagram-v2
    [*] --> Waiting: Crear stream
    Waiting --> Live: start_stream()
    Live --> Ended: end_stream()
    Ended --> [*]
    
    note right of Live
        viewers_count actualizado
        WebSocket activo
    end note
```

#### 2. **LiveStreamComment**

Gestiona comentarios en tiempo real:

- **live_stream**: Stream al que pertenece
- **user**: Usuario que comenta
- **content**: Contenido del comentario
- **created_at**: Timestamp del comentario

#### 3. **StreamModerator y StreamVIP**

Roles especiales dentro de un stream:

- **StreamModerator**: Usuarios con permisos de moderación
- **StreamVIP**: Usuarios con beneficios especiales

---

## 🔄 Flujos de Funcionamiento

### Crear y Empezar Stream:

```mermaid
sequenceDiagram
    actor S as Streamer
    participant F as Frontend
    participant API as REST API
    participant DB as Database
    participant WS as WebSocket
    
    S->>F: Click "Iniciar Stream"
    F->>API: POST /api/live/create/
    API->>DB: Crear LiveStream (status='waiting')
    DB-->>API: stream_id
    API-->>F: stream_id
    F->>WS: connect(stream_id)
    WS->>DB: Update status='live'
    WS-->>F: Connection established
    F->>F: Iniciar captura de cámara
    Note over S,WS: 🔴 Stream LIVE
```

**Pasos:**

1. **Creación**: El streamer crea un nuevo stream (estado: "waiting")
2. **Conexión WebSocket**: Se conecta al canal WebSocket específico del stream
3. **Inicio de transmisión**: Cambia estado a "live" y notifica disponibilidad
4. **Captura de media**: Accede a cámara/micrófono del navegador
5. **Listo para viewers**: El stream aparece en la lista de streams activos

### Unirse como Viewer:

```mermaid
sequenceDiagram
    actor V as Viewer
    participant F as Frontend
    participant WS as WebSocket
    participant S as Streamer
    
    V->>F: Abrir página del stream
    F->>WS: connect(stream_id)
    WS->>WS: Incrementar viewers
    WS->>S: user_joined event
    S->>WS: WebRTC offer
    WS->>F: Enviar offer
    F->>WS: WebRTC answer
    WS->>S: Enviar answer
    Note over V,S: 🎥 Stream conectado
```

**Pasos:**

1. **Conexión**: El viewer se conecta al WebSocket del stream
2. **Incremento de contador**: Se suma 1 al viewers_count
3. **Notificación**: El streamer recibe evento "user_joined"
4. **Señalización WebRTC**: Intercambio de offers/answers para establecer conexión P2P
5. **Stream activo**: El viewer recibe el video en tiempo real

### Finalizar Stream:

```mermaid
sequenceDiagram
    actor S as Streamer
    participant WS as WebSocket
    participant DB as Database
    participant V as Viewers
    
    S->>WS: end_stream
    WS->>DB: Update status='ended'
    WS->>V: stream_ended event
    V->>V: Detener reproducción
    WS->>WS: Cerrar conexiones
    Note over S,V: Stream finalizado
```

---

## 👥 Gestión de Viewers

### Contador en Tiempo Real:

El sistema mantiene un conteo preciso de espectadores:

```mermaid
graph LR
    A[Viewer 1 conecta] --> B[viewers_count = 1]
    B --> C[Viewer 2 conecta]
    C --> D[viewers_count = 2]
    D --> E[peak_viewers = 2]
    E --> F[Viewer 1 desconecta]
    F --> G[viewers_count = 1]
    G --> H[peak_viewers sigue en 2]
```

**Funcionalidades:**

- **Incremento**: Cada nuevo viewer suma 1 al contador
- **Decremento**: Cada desconexión resta 1 del contador
- **Pico histórico**: Se guarda el máximo de viewers alcanzado
- **Broadcast**: Todos los conectados reciben actualizaciones del contador

### Lista de Viewers:

El streamer puede ver quiénes están viendo:

- Lista de usernames conectados
- Indicador de roles (moderador, VIP, viewer normal)
- Acciones disponibles según rol

---

## 🎭 Sistema de Roles

```mermaid
graph TD
    A[Stream] --> B[Streamer]
    A --> C[Moderator]
    A --> D[VIP]
    A --> E[Viewer Regular]
    
    B --> F[Iniciar/Finalizar]
    B --> G[Kickear usuarios]
    B --> H[Nombrar moderadores]
    
    C --> I[Eliminar comentarios]
    C --> J[Timeout usuarios]
    
    D --> K[Chat destacado]
    D --> L[Emotes especiales]
    
    E --> M[Ver stream]
    E --> N[Comentar]
```

### Permisos por Rol:

| Acción | Streamer | Moderador | VIP | Viewer |
|--------|----------|-----------|-----|--------|
| Iniciar/Finalizar stream | ✅ | ❌ | ❌ | ❌ |
| Kickear usuarios | ✅ | ✅ | ❌ | ❌ |
| Eliminar comentarios | ✅ | ✅ | ❌ | ❌ |
| Timeout usuarios | ✅ | ✅ | ❌ | ❌ |
| Nombrar moderadores | ✅ | ❌ | ❌ | ❌ |
| Chat destacado | ✅ | ✅ | ✅ | ❌ |
| Ver stream | ✅ | ✅ | ✅ | ✅ |
| Comentar | ✅ | ✅ | ✅ | ✅ |

---

## 💬 Chat en Vivo

### Envío de Comentarios:

```mermaid
sequenceDiagram
    participant V as Viewer
    participant WS as WebSocket
    participant DB as Database
    participant ALL as Todos los Viewers
    
    V->>WS: send({ type: 'comment', content: '¡Hola!' })
    WS->>DB: Guardar LiveStreamComment
    WS->>ALL: Broadcast comment
    ALL-->>ALL: Mostrar comentario en UI
```

**Características:**

- **Tiempo real**: Los comentarios aparecen instantáneamente
- **Persistencia**: Se guardan en la base de datos
- **Broadcast**: Todos los viewers reciben el comentario
- **Orden cronológico**: Se muestran en orden de creación

### Moderación de Chat:

Los moderadores pueden:

1. **Eliminar comentarios**: Remover mensajes inapropiados
2. **Timeout usuarios**: Silenciar temporalmente a un usuario
3. **Kickear usuarios**: Expulsar del stream

```mermaid
graph TD
    A[Comentario enviado] --> B{Moderador revisa}
    B -->|Apropiado| C[Mostrar a todos]
    B -->|Inapropiado| D[Eliminar comentario]
    D --> E{Reincidencia?}
    E -->|Sí| F[Timeout/Kick]
    E -->|No| G[Advertencia]
```

---

## 📡 WebRTC y Señalización

### Arquitectura P2P:

```mermaid
graph TB
    subgraph Streamer
        A[Cámara/Micrófono]
        B[MediaStream]
        C[RTCPeerConnection]
    end
    
    subgraph WebSocket Server
        D[Señalización]
        E[ICE Candidates]
        F[Offers/Answers]
    end
    
    subgraph Viewer
        G[RTCPeerConnection]
        H[Video Element]
    end
    
    A --> B
    B --> C
    C <--> D
    D <--> G
    E --> G
    F --> G
    G --> H
    
    style D fill:#3498db
    style C fill:#e74c3c
    style G fill:#2ecc71
```

### Tipos de Mensajes WebSocket:

| Tipo | Dirección | Descripción |
|------|-----------|-------------|
| `connection_established` | Server → Client | Conexión exitosa |
| `offer` | Streamer → Server → Viewer | Oferta WebRTC |
| `answer` | Viewer → Server → Streamer | Respuesta WebRTC |
| `ice_candidate` | Bidireccional | Candidatos ICE para conectividad |
| `comment` | Viewer → Server → All | Comentario en chat |
| `viewers_update` | Server → All | Actualización de contador |
| `stream_ended` | Server → All | Stream finalizado |
| `user_joined` | Server → Streamer | Nuevo viewer se unió |
| `user_left` | Server → Streamer | Viewer se fue |

### Proceso de Conexión WebRTC:

```mermaid
sequenceDiagram
    participant S as Streamer
    participant WS as WebSocket
    participant V as Viewer
    
    Note over S,V: 1. Crear Peer Connections
    S->>WS: Crear offer
    WS->>V: Enviar offer
    Note over V: Procesar offer
    V->>WS: Crear answer
    WS->>S: Enviar answer
    Note over S: Procesar answer
    
    Note over S,V: 2. Intercambiar ICE Candidates
    S->>WS: ICE candidate
    WS->>V: ICE candidate
    V->>WS: ICE candidate
    WS->>S: ICE candidate
    
    Note over S,V: 3. Conexión P2P establecida
```

---

## 📊 Estadísticas de Streaming

### Métricas Disponibles:

- **viewers_count**: Espectadores actuales
- **peak_viewers**: Pico máximo alcanzado
- **duration**: Duración del stream
- **comments_count**: Total de comentarios
- **average_viewers**: Promedio de viewers durante el stream

```mermaid
graph LR
    A[Stream Stats] --> B[Viewers actuales: 45]
    A --> C[Pico: 78]
    A --> D[Duración: 2h 15m]
    A --> E[Comentarios: 234]
```

---

## 🛠️ Scripts de Mantenimiento

### Limpieza de Streams:

El sistema incluye scripts para mantener la BD limpia:

1. **cleanup_streams.py**: Finaliza streams antiguos que quedaron "colgados"
2. **check_streams.py**: Verifica estado de streams activos
3. **force_cleanup_streams.py**: Limpieza forzada de streams

**Triggers de limpieza:**

- Streams en estado "live" por más de 4 horas
- Streams sin viewers por más de 30 minutos
- Conexiones WebSocket huérfanas

---

## 🎯 Casos de Uso

### Caso 1: Stream Gaming

```mermaid
graph TD
    A[Gamer inicia stream] --> B[Transmite gameplay]
    B --> C[Viewers se conectan]
    C --> D[Chat en tiempo real]
    D --> E[Interacción con viewers]
    E --> F[Finaliza stream]
    F --> G[Estadísticas guardadas]
```

### Caso 2: Stream Educativo

```mermaid
graph TD
    A[Profesor inicia clase] --> B[Comparte pantalla + cámara]
    B --> C[Estudiantes se unen]
    C --> D[Preguntas por chat]
    D --> E[Moderadores ayudan]
    E --> F[Grabación disponible]
```

---

## ✅ Checklist de Funcionalidades

- [x] ✅ Creación de streams por usuarios
- [x] ✅ Transmisión WebRTC peer-to-peer
- [x] ✅ Señalización por WebSocket
- [x] ✅ Chat en tiempo real
- [x] ✅ Contador de viewers actualizado
- [x] ✅ Sistema de roles (Streamer, Mod, VIP)
- [x] ✅ Moderación de chat
- [x] ✅ Kickear/Timeout usuarios
- [x] ✅ Estadísticas de stream
- [x] ✅ Persistencia de comentarios
- [x] ✅ Lista de viewers para streamer
- [x] ✅ Scripts de limpieza automática

---

## 🎉 Resultado Final

Un sistema completo de streaming con:
- 🎥 **Transmisión en vivo** con WebRTC de baja latencia
- 🔌 **Señalización** robusta con WebSockets
- 👥 **Gestión de viewers** en tiempo real
- 💬 **Chat integrado** con moderación
- 📊 **Estadísticas detalladas**
- 🛡️ **Sistema de roles** y permisos

**¡Streaming profesional en RED-RED!** 📹

---