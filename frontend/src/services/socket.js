class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (!this.socket && token) {
      // Conexión WebSocket segura - token enviado en query string para autenticación
      const wsUrl = `ws://localhost:8000/ws/chat/?token=${encodeURIComponent(
        token
      )}`;
      this.socket = new WebSocket(wsUrl);
      this.token = token;

      this.socket.onopen = () => {
        // Enviar token de autenticación de forma segura después de conectar
        this.socket.send(
          JSON.stringify({
            type: "authenticate",
            token: this.token,
          })
        );
        // Conexión WebSocket establecida
        this.triggerListener("connect");
      };

      this.socket.onclose = (event) => {
        // WebSocket desconectado
        this.socket = null;
        this.triggerListener("disconnect");
      };

      this.socket.onerror = (error) => {
        // Error de conexión WebSocket manejado
        this.triggerListener("connect_error", error);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          // Error al parsear mensaje WebSocket
        }
      };
    }
    return this.socket;
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
        this.triggerListener("message", { message, room });
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
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.listeners.clear();
    }
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
