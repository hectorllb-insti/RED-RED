// Servicio para manejar la conexión WebSocket de notificaciones en tiempo real
class NotificationService {
  constructor() {
    this.ws = null;
    this.listeners = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.isConnecting = false;
  }

  connect(token) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    const wsUrl = `${process.env.REACT_APP_WS_URL || "ws://localhost:8000"}/ws/notifications/?token=${token}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.notifyListeners({ type: "connected" });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (error) {
          // Error de parsing silencioso
        }
      };

      this.ws.onerror = (error) => {
        this.isConnecting = false;
        this.notifyListeners({ type: "error", error });
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.notifyListeners({ type: "disconnected" });
        this.handleReconnect(token);
      };
    } catch (error) {
      this.isConnecting = false;
    }
  }

  handleReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(token), this.reconnectDelay);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners = [];
    this.reconnectAttempts = 0;
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error("WebSocket no está conectado");
    }
  }

  markAsRead(notificationId) {
    this.send({
      type: "mark_read",
      notification_id: notificationId,
    });
  }

  markAllAsRead() {
    this.send({
      type: "mark_all_read",
    });
  }

  getNotifications() {
    this.send({
      type: "get_notifications",
    });
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  notifyListeners(data) {
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error("Error en listener:", error);
      }
    });
  }
}

// Singleton para uso global
const notificationService = new NotificationService();

export default notificationService;
