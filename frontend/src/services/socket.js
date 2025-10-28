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
    if (!this.socket && token) {
      // Conexión WebSocket segura - token enviado en query string
      const wsUrl = `ws://localhost:8000/ws/chat/?token=${encodeURIComponent(
        token
      )}`;
      this.socket = new WebSocket(wsUrl);
      this.token = token;

      this.socket.onopen = () => {
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
        this.socket = null;
        this.triggerListener("disconnect");

        // Intentar reconectar si no fue cierre manual
        if (!event.wasClean && this.token) {
          this.attemptReconnect();
        }
      };

      this.socket.onerror = (error) => {
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
    if (
      this.isReconnecting ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      return;
    }

    this.isReconnecting = true;
    this.triggerListener("reconnecting", {
      attempt: this.reconnectAttempts + 1,
      maxAttempts: this.maxReconnectAttempts,
    });

    // Calcular delay exponencial: 1s, 2s, 4s, 8s, 16s, 30s (max)
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.isReconnecting = false;
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

    switch (type) {
      case "chat_message":
        // Asegurar que el mensaje tenga formato consistente
        let processedMessage = message;
        
        // Si el mensaje tiene contenido anidado, normalizarlo
        if (message && typeof message.content === 'string') {
          try {
            // Si el contenido parece ser JSON serializado, parsearlo
            if (message.content.startsWith('{') || message.content.startsWith('[')) {
              const parsed = JSON.parse(message.content);
              processedMessage = {
                ...message,
                content: parsed.content || parsed.message || parsed.text || message.content
              };
            }
          } catch (e) {
            // Si no es JSON válido, mantener el contenido original
            processedMessage = message;
          }
        }
        
        this.triggerListener("message", { message: processedMessage, room });
        break;
      case "user_joined":
        this.triggerListener("user_joined", { room, user: data.user });
        break;
      case "user_left":
        this.triggerListener("user_left", { room, user: data.user });
        break;
      default:
      // Mensaje WebSocket no reconocido
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

  // Remover listener de mensajes
  offMessage() {
    if (this.listeners.has("message")) {
      this.listeners.delete("message");
    }
  }

  // Verificar si está conectado
  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN;
  }
}

// Crear instancia única del servicio de socket
const socketService = new SocketService();
export default socketService;
