import {
  Bell,
  Camera,
  CheckCircle,
  Heart,
  MessageCircle,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import api from "../services/api";

const Notifications = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Query para obtener todas las notificaciones
  const { data: notifications = [], isLoading } = useQuery(
    ["notifications", filter],
    async () => {
      const params = filter !== "all" ? `?filter=${filter}` : "";
      const response = await api.get(`/notifications/${params}`);
      // Asegurar que devolvemos un array
      return Array.isArray(response.data) ? response.data : [];
    }
  );

  // Mutation para marcar como leída/no leída
  const toggleReadMutation = useMutation(
    async ({ notificationId, isRead }) => {
      const endpoint = isRead ? "unread" : "read";
      await api.post(`/notifications/${notificationId}/${endpoint}/`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notifications");
        toast.success("Estado actualizado");
      },
    }
  );

  // Mutation para marcar múltiples como leídas
  const bulkMarkReadMutation = useMutation(
    async (notificationIds) => {
      await api.post("/notifications/bulk-mark-read/", {
        notification_ids: notificationIds,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notifications");
        setSelectedNotifications([]);
        toast.success("Notificaciones marcadas como leídas");
      },
    }
  );

  // Mutation para eliminar notificaciones
  const bulkDeleteMutation = useMutation(
    async (notificationIds) => {
      await api.post("/notifications/bulk-delete/", {
        notification_ids: notificationIds,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notifications");
        setSelectedNotifications([]);
        toast.success("Notificaciones eliminadas");
      },
    }
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case "story":
        return <Camera className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedNotifications(notifications.map((n) => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (notificationId, checked) => {
    if (checked) {
      setSelectedNotifications([...selectedNotifications, notificationId]);
    } else {
      setSelectedNotifications(
        selectedNotifications.filter((id) => id !== notificationId)
      );
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.is_read;
    if (filter === "read") return notification.is_read;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-primary-50/30 to-purple-50/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary-600" />
                Notificaciones
              </h1>
              <p className="text-gray-600 text-sm mt-0.5">
                Administra todas tus notificaciones
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === "all"
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === "unread"
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                No leídas
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === "read"
                    ? "bg-primary-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Leídas
              </button>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedNotifications.length > 0 && (
            <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-700 font-medium">
                {selectedNotifications.length} notificación(es) seleccionada(s)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    bulkMarkReadMutation.mutate(selectedNotifications)
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg text-xs font-semibold hover:from-primary-700 hover:to-primary-600 shadow-md transition-all"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Marcar como leídas</span>
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "¿Estás seguro de eliminar estas notificaciones?"
                      )
                    ) {
                      bulkDeleteMutation.mutate(selectedNotifications);
                    }
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications list */}
        <div>
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-gray-500">
                {filter === "unread"
                  ? "No tienes notificaciones sin leer"
                  : filter === "read"
                  ? "No tienes notificaciones leídas"
                  : "Aún no has recibido ninguna notificación"}
              </p>
            </div>
          ) : (
            <div>
              {/* Select all header */}
              <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={
                    selectedNotifications.length ===
                    filteredNotifications.length
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Seleccionar todas
                </label>
              </div>

              {/* Notifications */}
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 transition-all ${
                      !notification.is_read ? "bg-primary-50/50 border-l-4 border-l-primary-500" : "border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(
                          notification.id
                        )}
                        onChange={(e) =>
                          handleSelectNotification(
                            notification.id,
                            e.target.checked
                          )
                        }
                        className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />

                      <div className="flex-shrink-0">
                        {notification.actor?.profile_picture ? (
                          <img
                            className="h-10 w-10 rounded-full ring-2 ring-gray-100"
                            src={notification.actor.profile_picture}
                            alt={notification.actor.full_name}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1.5 font-medium">
                              {formatDateTime(notification.created_at)}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.is_read && (
                              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                            )}

                            <button
                              onClick={() =>
                                toggleReadMutation.mutate({
                                  notificationId: notification.id,
                                  isRead: notification.is_read,
                                })
                              }
                              className="text-xs text-primary-600 hover:text-primary-700"
                            >
                              {notification.is_read
                                ? "Marcar como no leída"
                                : "Marcar como leída"}
                            </button>
                          </div>
                        </div>

                        {/* Action link */}
                        {notification.action_url && (
                          <div className="mt-3">
                            <Link
                              to={notification.action_url}
                              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                            >
                              Ver detalles →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
