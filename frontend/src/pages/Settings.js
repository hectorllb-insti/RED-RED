import { Bell, Lock, Palette, Save, Shield, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import DeleteAccountButtonSimple from "../components/DeleteAccountButtonSimple";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

const Settings = () => {
  const { user } = useAuth();
  const { theme, changeTheme, actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
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

  // Estados para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  // Query para obtener configuraciones actuales
  const { isLoading } = useQuery(
    "user-settings",
    async () => {
      // TODO: Implementar endpoint /users/settings/ en el backend
      // Por ahora, solo cargamos los datos del perfil del usuario
      return {
        privacy: {},
        notifications: {},
      };
    },
    {
      enabled: false, // Deshabilitado hasta implementar el endpoint
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
      // TODO: Implementar endpoint /users/privacy-settings/ en el backend
      // Por ahora guardamos is_private en el perfil
      const response = await api.put("/users/profile/", {
        is_private: settings.profile_visibility === "private",
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user-settings");
        toast.success("Configuración de privacidad actualizada");
      },
      onError: (error) => {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Error al actualizar la configuración de privacidad";
        toast.error(errorMessage);
        console.error("Error detallado:", error.response?.data);
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
      onError: (error) => {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          JSON.stringify(error.response?.data) ||
          "Error al actualizar el perfil";
        toast.error(errorMessage);
        console.error("Error detallado:", error.response?.data);
      },
    }
  );

  // Mutation para actualizar notificaciones
  const updateNotificationsMutation = useMutation(
    async (notifications) => {
      // TODO: Implementar endpoint /users/notification-settings/ en el backend
      // Por ahora solo simulamos el guardado
      return { success: true };
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user-settings");
        toast.success("Configuración de notificaciones guardada (local)");
      },
      onError: (error) => {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Error al actualizar las notificaciones";
        toast.error(errorMessage);
        console.error("Error detallado:", error.response?.data);
      },
    }
  );

  // Mutation para cambiar contraseña
  const changePasswordMutation = useMutation(
    async (passwords) => {
      const response = await api.post("/users/change-password/", passwords);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success("Contraseña actualizada exitosamente");
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
        setPasswordErrors({});
      },
      onError: (error) => {
        const errors = error.response?.data || {};
        setPasswordErrors(errors);
        toast.error(
          errors.error || errors.message || "Error al cambiar la contraseña"
        );
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

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordErrors({});

    // Validaciones
    const errors = {};

    if (!passwordData.current_password) {
      errors.current_password = "La contraseña actual es requerida";
    }

    if (!passwordData.new_password) {
      errors.new_password = "La nueva contraseña es requerida";
    } else if (passwordData.new_password.length < 8) {
      errors.new_password = "La contraseña debe tener al menos 8 caracteres";
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = "Las contraseñas no coinciden";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    changePasswordMutation.mutate({
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <div
        className={`rounded-xl shadow-md border ${isDark
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
          }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b ${isDark
              ? "border-slate-700 bg-gradient-to-r from-slate-700/30 to-slate-600/30"
              : "border-gray-200 bg-gradient-to-r from-primary-50/30 to-purple-50/30"
            }`}
        >
          <h1
            className={`text-xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"
              }`}
          >
            Configuración
          </h1>
          <p
            className={`text-sm mt-0.5 ${isDark ? "text-slate-400" : "text-gray-600"
              }`}
          >
            Administra tu cuenta y configuraciones de privacidad
          </p>
        </div>

        {/* Navigation Tabs */}
        <div
          className={`flex border-b ${isDark
              ? "border-slate-700 bg-slate-800/50"
              : "border-gray-200 bg-gray-50/50"
            }`}
        >
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === "profile"
                ? isDark
                  ? "border-primary-500 text-primary-400 bg-slate-800"
                  : "border-primary-600 text-primary-600 bg-white"
                : isDark
                  ? "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
          >
            <User className="h-3.5 w-3.5 inline mr-1.5" />
            Perfil
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === "privacy"
                ? isDark
                  ? "border-primary-500 text-primary-400 bg-slate-800"
                  : "border-primary-600 text-primary-600 bg-white"
                : isDark
                  ? "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Shield className="h-3.5 w-3.5 inline mr-1.5" />
            Privacidad
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === "notifications"
                ? isDark
                  ? "border-primary-500 text-primary-400 bg-slate-800"
                  : "border-primary-600 text-primary-600 bg-white"
                : isDark
                  ? "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Bell className="h-3.5 w-3.5 inline mr-1.5" />
            Notificaciones
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === "security"
                ? isDark
                  ? "border-primary-500 text-primary-400 bg-slate-800"
                  : "border-primary-600 text-primary-600 bg-white"
                : isDark
                  ? "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Lock className="h-3.5 w-3.5 inline mr-1.5" />
            Seguridad
          </button>
          <button
            onClick={() => setActiveTab("appearance")}
            className={`px-5 py-3 text-xs font-semibold border-b-2 transition-all ${activeTab === "appearance"
                ? isDark
                  ? "border-primary-500 text-primary-400 bg-slate-800"
                  : "border-primary-600 text-primary-600 bg-white"
                : isDark
                  ? "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
          >
            <Palette className="h-3.5 w-3.5 inline mr-1.5" />
            Apariencia
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3
                  className={`text-lg font-medium mb-4 ${isDark ? "text-slate-100" : "text-gray-900"
                    }`}
                >
                  Información del Perfil
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-gray-700"
                        }`}
                    >
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
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark
                          ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                          : "bg-white border-gray-300 text-gray-900"
                        }`}
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-gray-700"
                        }`}
                    >
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
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark
                          ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                          : "bg-white border-gray-300 text-gray-900"
                        }`}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-gray-700"
                      }`}
                  >
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
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark
                        ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                        : "bg-white border-gray-300 text-gray-900"
                      }`}
                    placeholder="Cuéntanos algo sobre ti..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-gray-700"
                        }`}
                    >
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
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark
                          ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                          : "bg-white border-gray-300 text-gray-900"
                        }`}
                      placeholder="Ciudad, País"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-gray-700"
                        }`}
                    >
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
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark
                          ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                          : "bg-white border-gray-300 text-gray-900"
                        }`}
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
                <h3
                  className={`text-lg font-medium mb-4 ${isDark ? "text-slate-100" : "text-gray-900"
                    }`}
                >
                  Configuración de Privacidad
                </h3>

                <div className="space-y-4">
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-gray-700"
                        }`}
                    >
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
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark
                          ? "bg-slate-700 border-slate-600 text-slate-100"
                          : "bg-white border-gray-300 text-gray-900"
                        }`}
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
                        <p
                          className={`font-medium ${isDark ? "text-slate-200" : "text-gray-900"
                            }`}
                        >
                          Permitir solicitudes de amistad
                        </p>
                        <p
                          className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"
                            }`}
                        >
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
                        <div
                          className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${isDark ? "bg-slate-600" : "bg-gray-200"
                            }`}
                        ></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`font-medium ${isDark ? "text-slate-200" : "text-gray-900"
                            }`}
                        >
                          Mostrar email
                        </p>
                        <p
                          className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"
                            }`}
                        >
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
                        <div
                          className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${isDark ? "bg-slate-600" : "bg-gray-200"
                            }`}
                        ></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`font-medium ${isDark ? "text-slate-200" : "text-gray-900"
                            }`}
                        >
                          Mensajes de desconocidos
                        </p>
                        <p
                          className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"
                            }`}
                        >
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
                        <div
                          className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${isDark ? "bg-slate-600" : "bg-gray-200"
                            }`}
                        ></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`font-medium ${isDark ? "text-slate-200" : "text-gray-900"
                            }`}
                        >
                          Estado en línea
                        </p>
                        <p
                          className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"
                            }`}
                        >
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
                        <div
                          className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${isDark ? "bg-slate-600" : "bg-gray-200"
                            }`}
                        ></div>
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
                <h3
                  className={`text-lg font-medium mb-4 ${isDark ? "text-slate-100" : "text-gray-900"
                    }`}
                >
                  Configuración de Notificaciones
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`font-medium ${isDark ? "text-slate-200" : "text-gray-900"
                          }`}
                      >
                        Notificaciones por email
                      </p>
                      <p
                        className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"
                          }`}
                      >
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
                      <div
                        className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${isDark ? "bg-slate-600" : "bg-gray-200"
                          }`}
                      ></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className={`font-medium ${isDark ? "text-slate-200" : "text-gray-900"
                          }`}
                      >
                        Notificaciones push
                      </p>
                      <p
                        className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"
                          }`}
                      >
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
                      <div
                        className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${isDark ? "bg-slate-600" : "bg-gray-200"
                          }`}
                      ></div>
                    </label>
                  </div>

                  <hr
                    className={`my-4 ${isDark ? "border-slate-700" : "border-gray-200"
                      }`}
                  />

                  <p
                    className={`font-medium mb-2 ${isDark ? "text-slate-200" : "text-gray-900"
                      }`}
                  >
                    Tipos de notificaciones
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`${isDark ? "text-slate-300" : "text-gray-700"
                          }`}
                      >
                        Likes en mis posts
                      </span>
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
                        <div
                          className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${isDark ? "bg-slate-600" : "bg-gray-200"
                            }`}
                        ></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`${isDark ? "text-slate-300" : "text-gray-700"
                          }`}
                      >
                        Comentarios
                      </span>
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
                        <div
                          className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${isDark ? "bg-slate-600" : "bg-gray-200"
                            }`}
                        ></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`${isDark ? "text-slate-300" : "text-gray-700"
                          }`}
                      >
                        Nuevos seguidores
                      </span>
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
                        <div
                          className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${isDark ? "bg-slate-600" : "bg-gray-200"
                            }`}
                        ></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`${isDark ? "text-slate-300" : "text-gray-700"
                          }`}
                      >
                        Mensajes privados
                      </span>
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
                        <div
                          className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 ${isDark ? "bg-slate-600" : "bg-gray-200"
                            }`}
                        ></div>
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
                <h3
                  className={`text-lg font-medium mb-4 ${isDark ? "text-slate-100" : "text-gray-900"
                    }`}
                >
                  Seguridad de la Cuenta
                </h3>

                {/* Cambiar Contraseña */}
                <div
                  className={`border rounded-lg p-6 mb-6 ${isDark ? "border-slate-700" : "border-gray-200"
                    }`}
                >
                  <h4
                    className={`font-medium mb-2 ${isDark ? "text-slate-200" : "text-gray-900"
                      }`}
                  >
                    Cambiar Contraseña
                  </h4>
                  <p
                    className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-gray-500"
                      }`}
                  >
                    Actualiza tu contraseña regularmente para mantener tu cuenta
                    segura
                  </p>

                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-gray-700"
                          }`}
                      >
                        Contraseña Actual
                      </label>
                      <input
                        type="password"
                        value={passwordData.current_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            current_password: e.target.value,
                          })
                        }
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark
                            ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                            : "bg-white border-gray-300 text-gray-900"
                          } ${passwordErrors.current_password
                            ? "border-red-500"
                            : isDark
                              ? "border-slate-600"
                              : "border-gray-300"
                          }`}
                        placeholder="Ingresa tu contraseña actual"
                      />
                      {passwordErrors.current_password && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordErrors.current_password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-gray-700"
                          }`}
                      >
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={passwordData.new_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            new_password: e.target.value,
                          })
                        }
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark
                            ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                            : "bg-white border-gray-300 text-gray-900"
                          } ${passwordErrors.new_password
                            ? "border-red-500"
                            : isDark
                              ? "border-slate-600"
                              : "border-gray-300"
                          }`}
                        placeholder="Mínimo 8 caracteres"
                      />
                      {passwordErrors.new_password && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordErrors.new_password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${isDark ? "text-slate-300" : "text-gray-700"
                          }`}
                      >
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirm_password: e.target.value,
                          })
                        }
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isDark
                            ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                            : "bg-white border-gray-300 text-gray-900"
                          } ${passwordErrors.confirm_password
                            ? "border-red-500"
                            : isDark
                              ? "border-slate-600"
                              : "border-gray-300"
                          }`}
                        placeholder="Repite la nueva contraseña"
                      />
                      {passwordErrors.confirm_password && (
                        <p className="text-red-500 text-sm mt-1">
                          {passwordErrors.confirm_password}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={changePasswordMutation.isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Lock className="h-4 w-4" />
                        <span>
                          {changePasswordMutation.isLoading
                            ? "Cambiando..."
                            : "Cambiar Contraseña"}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Próximamente */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800">
                    <strong>Próximamente:</strong> Autenticación de dos
                    factores, sesiones activas y configuración de seguridad
                    avanzada.
                  </p>
                </div>

                <div className="space-y-4">
                  <div
                    className={`border rounded-lg p-4 ${isDark ? "border-slate-700" : "border-gray-200"
                      }`}
                  >
                    <h4
                      className={`font-medium mb-2 ${isDark ? "text-slate-200" : "text-gray-900"
                        }`}
                    >
                      Autenticación de Dos Factores
                    </h4>
                    <p
                      className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-gray-500"
                        }`}
                    >
                      Agrega una capa extra de seguridad a tu cuenta
                    </p>
                    <button
                      disabled
                      className={`px-4 py-2 rounded-lg cursor-not-allowed ${isDark
                          ? "bg-slate-700 text-slate-500"
                          : "bg-gray-300 text-gray-500"
                        }`}
                    >
                      Próximamente
                    </button>
                  </div>

                  <div
                    className={`border rounded-lg p-4 ${isDark ? "border-slate-700" : "border-gray-200"
                      }`}
                  >
                    <h4
                      className={`font-medium mb-2 ${isDark ? "text-slate-200" : "text-gray-900"
                        }`}
                    >
                      Sesiones Activas
                    </h4>
                    <p
                      className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-gray-500"
                        }`}
                    >
                      Revisa y cierra sesiones en otros dispositivos
                    </p>
                    <button
                      disabled
                      className={`px-4 py-2 rounded-lg cursor-not-allowed ${isDark
                          ? "bg-slate-700 text-slate-500"
                          : "bg-gray-300 text-gray-500"
                        }`}
                    >
                      Próximamente
                    </button>
                  </div>
                </div>

                {/* Zona de Peligro - Eliminar Cuenta */}
                <div className="mt-8">
                  <DeleteAccountButtonSimple />
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-6">
              <div>
                <h3
                  className={`text-lg font-medium mb-4 ${isDark ? "text-slate-100" : "text-gray-900"
                    }`}
                >
                  Apariencia y Personalización
                </h3>

                {/* Tema */}
                <div
                  className={`border rounded-lg p-6 mb-6 ${isDark ? "border-slate-700" : "border-gray-200"
                    }`}
                >
                  <h4
                    className={`font-medium mb-2 ${isDark ? "text-slate-200" : "text-gray-900"
                      }`}
                  >
                    Tema de Interfaz
                  </h4>
                  <p
                    className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-gray-500"
                      }`}
                  >
                    Elige el tema de la interfaz que más te guste. El modo
                    automático se adapta a la configuración de tu sistema.
                  </p>

                  <div className="flex justify-center py-4">
                    <ThemeToggle variant="segmented" showLabel={true} />
                  </div>

                  <div
                    className={`mt-6 p-4 rounded-lg border ${isDark
                        ? "bg-slate-800/50 border-blue-900/50"
                        : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                      }`}
                  >
                    <p
                      className={`text-sm ${isDark ? "text-blue-300" : "text-blue-800"
                        }`}
                    >
                      <strong>✨ Consejos:</strong>
                    </p>
                    <ul
                      className={`text-sm mt-2 space-y-1 list-disc list-inside ${isDark ? "text-blue-400" : "text-blue-700"
                        }`}
                    >
                      <li>
                        <strong>Claro:</strong> Ideal para ambientes bien
                        iluminados
                      </li>
                      <li>
                        <strong>Oscuro:</strong> Reduce el cansancio visual en
                        ambientes con poca luz
                      </li>
                      <li>
                        <strong>Automático:</strong> Cambia según la hora del
                        día y configuración del sistema
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Próximamente - Otras personalizaciones */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>Próximamente:</strong> Personalización de colores de
                    acento, fuentes, tamaño de texto y más opciones de
                    visualización.
                  </p>
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
