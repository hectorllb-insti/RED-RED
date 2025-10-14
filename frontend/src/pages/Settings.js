import { Bell, Lock, Save, Shield, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Settings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  // Estados para configuración de privacidad
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: "public", // public, friends, private
    allow_friend_requests: true,
    show_email: false,
    show_phone: false,
    allow_messages_from_strangers: true,
    show_online_status: true,
  });

  // Estados para configuración de perfil
  const [profileSettings, setProfileSettings] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
  });

  // Estados para notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    like_notifications: true,
    comment_notifications: true,
    follow_notifications: true,
    message_notifications: true,
  });

  // Query para obtener configuraciones actuales
  const { isLoading } = useQuery(
    "user-settings",
    async () => {
      const response = await api.get("/users/settings/");
      return response.data;
    },
    {
      onSuccess: (data) => {
        if (data.privacy) {
          setPrivacySettings({ ...privacySettings, ...data.privacy });
        }
        if (data.notifications) {
          setNotificationSettings({
            ...notificationSettings,
            ...data.notifications,
          });
        }
      },
    }
  );

  // Mutation para actualizar configuración de privacidad
  const updatePrivacyMutation = useMutation(
    async (settings) => {
      const response = await api.put("/users/privacy-settings/", settings);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user-settings");
        toast.success("Configuración de privacidad actualizada");
      },
      onError: () => {
        toast.error("Error al actualizar la configuración de privacidad");
      },
    }
  );

  // Mutation para actualizar perfil
  const updateProfileMutation = useMutation(
    async (profile) => {
      const response = await api.put("/users/profile/", profile);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["profile"]);
        queryClient.invalidateQueries("user-settings");
        toast.success("Perfil actualizado");
      },
      onError: () => {
        toast.error("Error al actualizar el perfil");
      },
    }
  );

  // Mutation para actualizar notificaciones
  const updateNotificationsMutation = useMutation(
    async (notifications) => {
      const response = await api.put(
        "/users/notification-settings/",
        notifications
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user-settings");
        toast.success("Configuración de notificaciones actualizada");
      },
      onError: () => {
        toast.error("Error al actualizar las notificaciones");
      },
    }
  );

  const handlePrivacySave = () => {
    updatePrivacyMutation.mutate(privacySettings);
  };

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileSettings);
  };

  const handleNotificationsSave = () => {
    updateNotificationsMutation.mutate(notificationSettings);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">
            Administra tu cuenta y configuraciones de privacidad
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === "profile"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="h-4 w-4 inline mr-2" />
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === "privacy"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Privacidad
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === "notifications"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Bell className="h-4 w-4 inline mr-2" />
            Notificaciones
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === "security"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Lock className="h-4 w-4 inline mr-2" />
            Seguridad
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Información del Perfil
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={profileSettings.first_name}
                      onChange={(e) =>
                        setProfileSettings({
                          ...profileSettings,
                          first_name: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={profileSettings.last_name}
                      onChange={(e) =>
                        setProfileSettings({
                          ...profileSettings,
                          last_name: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Biografía
                  </label>
                  <textarea
                    value={profileSettings.bio}
                    onChange={(e) =>
                      setProfileSettings({
                        ...profileSettings,
                        bio: e.target.value,
                      })
                    }
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Cuéntanos algo sobre ti..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={profileSettings.location}
                      onChange={(e) =>
                        setProfileSettings({
                          ...profileSettings,
                          location: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Ciudad, País"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sitio Web
                    </label>
                    <input
                      type="url"
                      value={profileSettings.website}
                      onChange={(e) =>
                        setProfileSettings({
                          ...profileSettings,
                          website: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleProfileSave}
                    disabled={updateProfileMutation.isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      {updateProfileMutation.isLoading
                        ? "Guardando..."
                        : "Guardar"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Configuración de Privacidad
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibilidad del Perfil
                    </label>
                    <select
                      value={privacySettings.profile_visibility}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          profile_visibility: e.target.value,
                        })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="public">
                        Público - Visible para todos
                      </option>
                      <option value="friends">
                        Amigos - Solo personas que sigues
                      </option>
                      <option value="private">Privado - Solo tú</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Permitir solicitudes de amistad
                        </p>
                        <p className="text-sm text-gray-500">
                          Otros usuarios pueden enviarte solicitudes para
                          seguirte
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.allow_friend_requests}
                          onChange={(e) =>
                            setPrivacySettings({
                              ...privacySettings,
                              allow_friend_requests: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Mostrar email
                        </p>
                        <p className="text-sm text-gray-500">
                          Tu dirección de email será visible en tu perfil
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.show_email}
                          onChange={(e) =>
                            setPrivacySettings({
                              ...privacySettings,
                              show_email: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Mensajes de desconocidos
                        </p>
                        <p className="text-sm text-gray-500">
                          Personas que no sigues pueden enviarte mensajes
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            privacySettings.allow_messages_from_strangers
                          }
                          onChange={(e) =>
                            setPrivacySettings({
                              ...privacySettings,
                              allow_messages_from_strangers: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          Estado en línea
                        </p>
                        <p className="text-sm text-gray-500">
                          Otros usuarios pueden ver cuando estás activo
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.show_online_status}
                          onChange={(e) =>
                            setPrivacySettings({
                              ...privacySettings,
                              show_online_status: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handlePrivacySave}
                    disabled={updatePrivacyMutation.isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      {updatePrivacyMutation.isLoading
                        ? "Guardando..."
                        : "Guardar"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Configuración de Notificaciones
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Notificaciones por email
                      </p>
                      <p className="text-sm text-gray-500">
                        Recibir notificaciones en tu correo electrónico
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.email_notifications}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            email_notifications: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Notificaciones push
                      </p>
                      <p className="text-sm text-gray-500">
                        Recibir notificaciones en tiempo real en el navegador
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.push_notifications}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            push_notifications: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <hr className="my-4" />

                  <p className="font-medium text-gray-900 mb-2">
                    Tipos de notificaciones
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Likes en mis posts</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.like_notifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              like_notifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Comentarios</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.comment_notifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              comment_notifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Nuevos seguidores</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.follow_notifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              follow_notifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Mensajes privados</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.message_notifications}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              message_notifications: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleNotificationsSave}
                    disabled={updateNotificationsMutation.isLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>
                      {updateNotificationsMutation.isLoading
                        ? "Guardando..."
                        : "Guardar"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Seguridad de la Cuenta
                </h3>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800">
                    <strong>Próximamente:</strong> Cambio de contraseña,
                    autenticación de dos factores, sesiones activas y
                    configuración de seguridad avanzada.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Cambiar Contraseña
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Actualiza tu contraseña regularmente para mantener tu
                      cuenta segura
                    </p>
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                    >
                      Próximamente
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Autenticación de Dos Factores
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Agrega una capa extra de seguridad a tu cuenta
                    </p>
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                    >
                      Próximamente
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Sesiones Activas
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Revisa y cierra sesiones en otros dispositivos
                    </p>
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                    >
                      Próximamente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
