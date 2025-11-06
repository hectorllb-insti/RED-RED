import { Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const AdminConfig = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    site_name: "",
    max_post_length: 5000,
    max_comment_length: 1000,
    max_bio_length: 500,
    allow_registration: true,
    allow_post_creation: true,
    allow_comments: true,
    allow_likes: true,
    allow_follows: true,
    require_email_verification: false,
    enable_notifications: true,
    enable_stories: true,
    maintenance_mode: false,
    maintenance_message: "",
  });

  // Verificar permisos (solo admin)
  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("Solo los administradores pueden acceder a esta página");
      navigate("/");
    }
  }, [user, navigate]);

  // Obtener configuración actual
  const { isLoading } = useQuery(
    "admin-config",
    async () => {
      const response = await api.get("/administration/config/");
      return response.data;
    },
    {
      enabled: user && user.role === "admin",
      onSuccess: (data) => {
        // Manejar respuesta paginada o array directo
        const configs = Array.isArray(data) ? data : data?.results || [];
        if (configs && configs.length > 0) {
          setFormData(configs[0]);
        }
      },
    }
  );

  // Mutación para actualizar configuración
  const updateConfigMutation = useMutation(
    async (data) => {
      // Limpiar campos de solo lectura
      const cleanData = { ...data };
      delete cleanData.id;
      delete cleanData.updated_at;
      delete cleanData.updated_by;
      delete cleanData.updated_by_username;

      if (formData.id) {
        // Actualizar configuración existente
        return await api.put(
          `/administration/config/${formData.id}/`,
          cleanData
        );
      } else {
        // Crear nueva configuración
        return await api.post("/administration/config/", cleanData);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("admin-config");
        toast.success("Configuración actualizada exitosamente");
      },
      onError: (error) => {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Error al actualizar configuración";
        toast.error(errorMessage);
        console.error("Error detallado:", error.response?.data);
      },
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateConfigMutation.mutate(formData);
  };

  if (isLoading) {
    return <LoadingSpinner text="Cargando configuración..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Configuración del Sitio
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Configura los límites, permisos y características del sitio
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Información General */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">
                Información General
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Sitio
                </label>
                <input
                  type="text"
                  name="site_name"
                  value={formData.site_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Mi Red Social"
                />
              </div>
            </div>
          </div>

          {/* Límites de Contenido */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Límites de Contenido
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitud Máx. de Post
                </label>
                <input
                  type="number"
                  name="max_post_length"
                  value={formData.max_post_length}
                  onChange={handleChange}
                  min="100"
                  max="10000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitud Máx. de Comentario
                </label>
                <input
                  type="number"
                  name="max_comment_length"
                  value={formData.max_comment_length}
                  onChange={handleChange}
                  min="50"
                  max="5000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitud Máx. de Bio
                </label>
                <input
                  type="number"
                  name="max_bio_length"
                  value={formData.max_bio_length}
                  onChange={handleChange}
                  min="50"
                  max="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Permisos y Características */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Permisos y Características
            </h2>

            <div className="space-y-4">
              {/* Registration */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Permitir Registro
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Los nuevos usuarios pueden crear cuentas
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allow_registration"
                    checked={formData.allow_registration}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Post Creation */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Permitir Creación de Posts
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Los usuarios pueden crear nuevos posts
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allow_post_creation"
                    checked={formData.allow_post_creation}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Comments */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Permitir Comentarios
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Los usuarios pueden comentar en posts
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allow_comments"
                    checked={formData.allow_comments}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Likes */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Permitir Likes
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Los usuarios pueden dar likes a posts y comentarios
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allow_likes"
                    checked={formData.allow_likes}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Follows */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Permitir Seguir Usuarios
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Los usuarios pueden seguir a otros usuarios
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="allow_follows"
                    checked={formData.allow_follows}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Email Verification */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Requerir Verificación de Email
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Los usuarios deben verificar su email
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="require_email_verification"
                    checked={formData.require_email_verification}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Habilitar Notificaciones
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Sistema de notificaciones activo
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="enable_notifications"
                    checked={formData.enable_notifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Stories */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Habilitar Historias
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Los usuarios pueden crear historias
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="enable_stories"
                    checked={formData.enable_stories}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Modo Mantenimiento */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Modo Mantenimiento
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Activar Modo Mantenimiento
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    El sitio mostrará una página de mantenimiento
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="maintenance_mode"
                    checked={formData.maintenance_mode}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {formData.maintenance_mode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje de Mantenimiento
                  </label>
                  <textarea
                    name="maintenance_message"
                    value={formData.maintenance_message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder="Estamos realizando mejoras. Volveremos pronto..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateConfigMutation.isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {updateConfigMutation.isLoading
                ? "Guardando..."
                : "Guardar Configuración"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminConfig;
