import io from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (!this.socket) {
      this.socket = io("ws://localhost:8000", {
        auth: {
          token: token,
        },
        transports: ["websocket"],
      });

      this.socket.on("connect", () => {
        console.log("Conectado al servidor WebSocket");
      });

      this.socket.on("disconnect", () => {
        console.log("Desconectado del servidor WebSocket");
      });

      this.socket.on("connect_error", (error) => {
        console.error("Error de conexión WebSocket:", error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Unirse a una sala de chat
  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit("join_room", { room: roomId });
    }
  }

  // Enviar mensaje
  sendMessage(roomId, message) {
    if (this.socket) {
      this.socket.emit("send_message", {
        room: roomId,
        message: message,
      });
    }
  }

  // Escuchar mensajes
  onMessage(callback) {
    if (this.socket) {
      this.socket.on("receive_message", callback);
    }
  }

  // Remover listener de mensajes
  offMessage() {
    if (this.socket) {
      this.socket.off("receive_message");
    }
  }
}

export default new SocketService();
