import { Bell, Heart, MessageCircle, UserPlus, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import notificationService from "../services/notificationService";

const NotificationCenter = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Query para obtener notificaciones
  const { data: notifications = [], isLoading } = useQuery(
    "notifications",
    async () => {
      const response = await api.get("/notifications/");
      // Asegurar que devolvemos un array
      return Array.isArray(response.data) ? response.data : [];
    },
    {
      enabled: !!user,
      onSuccess: (data) => {
        // Verificar que data es un array antes de usar filter
        if (Array.isArray(data)) {
          const unread = data.filter((n) => !n.is_read).length;
          setUnreadCount(unread);
        } else {
          setUnreadCount(0);
        }
      },
    }
  );

  // Mutation para marcar como leída
  const markReadMutation = useMutation(
    async (notificationId) => {
      await api.post(`/notifications/${notificationId}/read/`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notifications");
      },
    }
  );

  // Mutation para marcar todas como leídas
  const markAllReadMutation = useMutation(
    async () => {
      await api.post("/notifications/mark-all-read/");
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notifications");
        setUnreadCount(0);
      },
    }
  );

  // Mutation para eliminar notificación
  const deleteNotificationMutation = useMutation(
    async (notificationId) => {
      await api.delete(`/notifications/${notificationId}/`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notifications");
      },
    }
  );

  // Función memoizada para iconos de notificación
  const getNotificationIcon = useMemo(
    () => (type) => {
      switch (type) {
        case "like":
          return <Heart className="h-5 w-5 text-red-500" />;
        case "comment":
          return <MessageCircle className="h-5 w-5 text-blue-500" />;
        case "follow":
          return <UserPlus className="h-5 w-5 text-green-500" />;
        case "post":
          return <MessageCircle className="h-5 w-5 text-purple-500" />;
        default:
          return <Bell className="h-5 w-5 text-gray-500" />;
      }
    },
    []
  );

  // Conectar WebSocket y escuchar notificaciones en tiempo real
  useEffect(() => {
    if (!user) return;

    // Obtener token del localStorage
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Conectar al servicio de notificaciones
    notificationService.connect(token);

    // Listener para mensajes del WebSocket
    const removeListener = notificationService.addListener((data) => {
      switch (data.type) {
        case "connected":
          setIsConnected(true);
          break;

        case "disconnected":
          setIsConnected(false);
          break;

        case "new_notification":
          // Agregar nueva notificación a la lista
          queryClient.setQueryData("notifications", (oldData) => {
            return [data.notification, ...(oldData || [])];
          });

          // Incrementar contador
          setUnreadCount((prev) => prev + 1);

          // Reproducir sonido (opcional)
          try {
            const audio = new Audio("/notification.mp3");
            audio.volume = 0.3;
            audio.play().catch(() => {});
          } catch (e) {}

          // Mostrar toast
          toast(
            <div className="flex items-center space-x-3">
              {getNotificationIcon(data.notification.notification_type)}
              <div>
                <p className="font-medium text-sm">{data.notification.title}</p>
                <p className="text-xs text-gray-600">
                  {data.notification.message}
                </p>
              </div>
            </div>,
            {
              duration: 5000,
              position: "top-right",
            }
          );
          break;

        case "unread_count":
          setUnreadCount(data.count);
          break;

        case "notification_marked_read":
          if (data.success) {
            queryClient.invalidateQueries("notifications");
          }
          break;

        case "all_notifications_marked_read":
          setUnreadCount(0);
          queryClient.invalidateQueries("notifications");
          break;

        default:
          break;
      }
    });

    // Cleanup al desmontar
    return () => {
      removeListener();
    };
  }, [user, queryClient, getNotificationIcon]);

  const formatRelativeTime = useCallback((dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString();
  }, []);

  const handleNotificationClick = useCallback(
    (notification) => {
      if (!notification.is_read) {
        markReadMutation.mutate(notification.id);
        // También marcar en el WebSocket
        notificationService.markAsRead(notification.id);
      }
      setIsOpen(false);
      // Aquí podrías agregar lógica para navegar a la URL específica
    },
    [markReadMutation]
  );

  const handleMarkAllRead = useCallback(() => {
    markAllReadMutation.mutate();
    notificationService.markAllAsRead();
  }, [markAllReadMutation]);

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 transition-colors ${
          isConnected
            ? "text-primary-500 hover:text-primary-600"
            : "text-gray-400 hover:text-gray-500"
        }`}
        title={isConnected ? "Notificaciones (Tiempo real)" : "Notificaciones"}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Notificaciones
              </h3>
              {isConnected && (
                <span
                  className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                  title="Conectado en tiempo real"
                ></span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={markAllReadMutation.isLoading}
                  className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  Marcar todas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notification.is_read ? "bg-primary-50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {notification.actor?.profile_picture ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={notification.actor.profile_picture}
                            alt={notification.actor.full_name}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {notification.title}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(notification.created_at)}
                            </span>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2 mt-2">
                          {notification.action_url && (
                            <Link
                              to={notification.action_url}
                              className="text-xs text-primary-600 hover:text-primary-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Ver detalles
                            </Link>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(
                                notification.id
                              );
                            }}
                            className="text-xs text-gray-400 hover:text-red-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <Link
                to="/notifications"
                className="block text-center text-sm text-primary-600 hover:text-primary-700"
                onClick={() => setIsOpen(false)}
              >
                Ver todas las notificaciones
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default React.memo(NotificationCenter);
