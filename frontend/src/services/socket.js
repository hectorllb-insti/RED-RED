class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 500; // Reducido de 1000ms a 500ms - reconexión más rápida
    this.maxReconnectDelay = 15000; // Reducido de 30s a 15s - menos tiempo de espera máximo
    this.reconnectTimer = null;
    this.isReconnecting = false;
  }

  connect(token) {
    // Si ya existe una conexión activa, no crear una nueva
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return this.socket;
    }

    if (token) {
      console.log("🔌 Intentando conectar WebSocket...");
      console.log("📝 Token presente:", token ? "Sí (longitud: " + token.length + ")" : "No");
      
      // Conexión WebSocket segura - token enviado en query string
      const wsBaseUrl = process.env.REACT_APP_WS_URL || "ws://localhost:8000";
      const wsUrl = `${wsBaseUrl}/ws/chat/?token=${encodeURIComponent(token)}`;
      console.log("🌐 URL WebSocket:", wsBaseUrl + "/ws/chat/?token=***");
      
      this.socket = new WebSocket(wsUrl);
      this.token = token;

      this.socket.onopen = () => {
        console.log("✅ WebSocket conectado exitosamente");
        // Enviar token de autenticación
        this.socket.send(
          JSON.stringify({
            type: "authenticate",
            token: this.token,
          })
        );
        // Resetear contadores de reconexión
        this.reconnectAttempts = 0;
        this.reconnectDelay = 500; // Consistente con el valor inicial optimizado
        this.isReconnecting = false;
        this.triggerListener("connect");
      };

      this.socket.onclose = (event) => {
        console.log("❌ WebSocket cerrado:", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        
        this.socket = null;
        this.triggerListener("disconnect");

        // Códigos de cierre que NO deberían intentar reconectar:
        // 1000 = cierre normal
        // 1008 = violación de política (probablemente autenticación fallida)
        // 4000-4999 = códigos personalizados de la aplicación
        const shouldNotReconnect = event.code === 1000 || 
                                   event.code === 1008 || 
                                   (event.code >= 4000 && event.code < 5000);

        // Intentar reconectar si no fue cierre manual y el código permite reconexión
        if (!event.wasClean && this.token && !shouldNotReconnect) {
          this.attemptReconnect();
        } else if (shouldNotReconnect) {
          console.warn("⚠️ No se intentará reconectar. Código de cierre:", event.code);
          this.isReconnecting = false;
        }
      };

      this.socket.onerror = (error) => {
        console.error("❌ Error en WebSocket:", error);
        this.triggerListener("connect_error", error);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };
    }
    return this.socket;
  }

  attemptReconnect() {
    if (this.isReconnecting) {
      console.log("⏳ Ya hay un intento de reconexión en curso");
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("❌ Máximo de intentos de reconexión alcanzado");
      this.isReconnecting = false;
      this.triggerListener("max_reconnect_attempts_reached");
      return;
    }

    this.isReconnecting = true;
    console.log(`🔄 Intento de reconexión ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts}`);
    
    this.triggerListener("reconnecting", {
      attempt: this.reconnectAttempts + 1,
      maxAttempts: this.maxReconnectAttempts,
    });

    // Calcular delay exponencial: 0.5s, 1s, 2s, 4s, 8s, 15s (max)
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    console.log(`⏱️ Esperando ${delay}ms antes de reconectar...`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      // No resetear isReconnecting aquí - se reseteará cuando la conexión sea exitosa
      this.connect(this.token);
    }, delay);
  }

  cancelReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.isReconnecting = false;
  }

  // Agregar listener personalizado
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Disparar listeners
  triggerListener(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((callback) => callback(data));
    }
  }

  // Manejar mensajes entrantes
  handleMessage(data) {
    const { type, message, room } = data;
    
    console.log("🔗 WebSocket mensaje recibido:", data);

    switch (type) {
      case "chat_message":
        let processedMessage = message;
        
        // Si el mensaje tiene contenido anidado, normalizarlo
        if (message && typeof message.content === 'string') {
          try {
            // Si el contenido parece ser JSON serializado, parsearlo
            if (message.content.startsWith('{') || message.content.startsWith('[')) {
              const parsed = JSON.parse(message.content);
              processedMessage = {
                ...message,
                content:
                  parsed.content ||
                  parsed.message ||
                  parsed.text ||
                  message.content,
              };
            }
          } catch (e) {
            processedMessage = message;
          }
        }

        this.triggerListener("message", { message: processedMessage, room });
        break;
      case "profile_updated":
        // Manejar actualización de perfil de usuario
        console.log("📸 WebSocket profile_updated recibido:", data);
        console.log("👤 Usuario ID:", data.user_id);
        console.log("📊 User data:", data.user_data);
        
        this.triggerListener("profile_updated", { 
          user_id: data.user_id, 
          user_data: data.user_data 
        });
        break;
      case "typing_start":
        this.triggerListener("typing_start", { 
          room: data.room, 
          user: data.user,
          username: data.username 
        });
        break;
      case "typing_stop":
        this.triggerListener("typing_stop", { 
          room: data.room, 
          user: data.user,
          username: data.username 
        });
        break;
      case "user_joined":
        this.triggerListener("user_joined", { room, user: data.user });
        break;
      case "user_left":
        this.triggerListener("user_left", { room, user: data.user });
        break;
      default:
        // Mensaje no reconocido - ignorar silenciosamente
        break;
    }
  }

  disconnect() {
    this.cancelReconnect();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.listeners.clear();
    }
    this.reconnectAttempts = 0;
    this.token = null;
  }

  // Enviar mensaje al WebSocket
  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      // WebSocket no disponible para envío
    }
  }

  // Unirse a una sala de chat
  joinRoom(roomId) {
    this.send({
      type: "join_room",
      room: roomId,
    });
  }

  // Enviar mensaje
  sendMessage(roomId, message) {
    this.send({
      type: "send_message",
      room: roomId,
      message: message,
    });
  }

  // Escuchar mensajes
  onMessage(callback) {
    this.on("message", callback);
  }

  // Escuchar actualizaciones de perfil
  onProfileUpdate(callback) {
    this.on("profile_updated", callback);
  }

  // Remover listener de mensajes
  offMessage() {
    if (this.listeners.has("message")) {
      this.listeners.delete("message");
    }
  }

  // Remover listener de actualizaciones de perfil
  offProfileUpdate() {
    if (this.listeners.has("profile_updated")) {
      this.listeners.delete("profile_updated");
    }
  }

  // Verificar si está conectado
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }

  // Verificar si está reconectando
  getIsReconnecting() {
    return this.isReconnecting;
  }
}

// Crear instancia única del servicio de socket
const socketService = new SocketService();
export default socketService;
