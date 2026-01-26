import { Camera, Loader2, Save, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

const ProfileEdit = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    date_of_birth: user?.date_of_birth || "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(
    user?.profile_picture || null
  );
  const [coverPicture, setCoverPicture] = useState(null);
  const [coverPicturePreview, setCoverPicturePreview] = useState(
    user?.cover_picture || null
  );

  // Mutation para actualizar perfil
  const updateProfileMutation = useMutation(
    async (data) => {
      const response = await api.patch("/users/profile/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    {
      onSuccess: async (data) => {
        updateUser(data);
        // Invalidar todas las queries que puedan contener la imagen de perfil
        await queryClient.invalidateQueries("user");
        await queryClient.invalidateQueries("profile");
        await queryClient.invalidateQueries("posts");
        await queryClient.invalidateQueries("stories");
        await queryClient.invalidateQueries("comments");
        await queryClient.invalidateQueries("chats");

        // Refetch forzado de las queries más importantes
        queryClient.refetchQueries("posts");
        queryClient.refetchQueries("stories");

        toast.success("Perfil actualizado exitosamente");
        if (onClose) onClose();
      },
      onError: (error) => {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Error al actualizar el perfil";
        toast.error(errorMessage);
      },
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen es demasiado grande. Máximo 5MB");
        return;
      }

      // Validar tipo
      if (
        ![
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/webp",
          "image/gif",
        ].includes(file.type)
      ) {
        toast.error("Tipo de archivo no permitido. Solo JPEG, PNG y WebP");
        return;
      }

      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("La imagen es demasiado grande. Máximo 10MB");
        return;
      }

      // Validar tipo
      if (
        ![
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/webp",
          "image/gif",
        ].includes(file.type)
      ) {
        toast.error("Tipo de archivo no permitido. Solo JPEG, PNG y WebP");
        return;
      }

      setCoverPicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Crear FormData
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    if (profilePicture) {
      data.append("profile_picture", profilePicture);
    }

    if (coverPicture) {
      data.append("cover_picture", coverPicture);
    }

    updateProfileMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Overlay */}
        <div
          className={`fixed inset-0 z-[9999] transition-opacity backdrop-blur-sm ${
            isDark ? "bg-black/70" : "bg-gray-500/60"
          }`}
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div
          className={`relative z-[10000] inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-2xl ${
            isDark
              ? "bg-slate-900 border border-slate-700"
              : "bg-white border border-gray-100"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3
              className={`text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Editar Perfil
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? "text-slate-400 hover:text-white hover:bg-slate-800"
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cover Picture */}
            <div className="relative">
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Imagen de portada
              </label>
              <div className="relative h-48 bg-gradient-to-r from-primary-400 to-primary-600 rounded-xl overflow-hidden">
                {coverPicturePreview ? (
                  <img
                    src={coverPicturePreview}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Camera className="h-12 w-12 text-white opacity-50" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPictureChange}
                  className="hidden"
                  id="cover-picture-input"
                />
                <label
                  htmlFor="cover-picture-input"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="h-8 w-8 text-white" />
                  <span className="ml-2 text-white font-medium">
                    Cambiar portada
                  </span>
                </label>
              </div>
            </div>

            {/* Profile Picture */}
            <div className="relative -mt-20 ml-6 w-32">
              <label
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Foto de perfil
              </label>
              <div
                className={`relative w-32 h-32 rounded-full overflow-hidden ring-4 ${
                  isDark
                    ? "ring-slate-900 bg-slate-800"
                    : "ring-white bg-gray-200"
                }`}
              >
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Camera
                      className={`h-8 w-8 ${
                        isDark ? "text-slate-600" : "text-gray-400"
                      }`}
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  id="profile-picture-input"
                />
                <label
                  htmlFor="profile-picture-input"
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="h-6 w-6 text-white" />
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
              <div>
                <label
                  htmlFor="first_name"
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Nombre
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  }`}
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label
                  htmlFor="last_name"
                  className={`block text-sm font-medium mb-2 ${
                    isDark ? "text-slate-300" : "text-gray-700"
                  }`}
                >
                  Apellido
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                    isDark
                      ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  }`}
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="bio"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Biografía
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                maxLength="200"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-colors ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Cuéntanos sobre ti..."
              />
              <p
                className={`text-xs mt-1 ${
                  isDark ? "text-slate-500" : "text-gray-500"
                }`}
              >
                {formData.bio.length}/200 caracteres
              </p>
            </div>

            <div>
              <label
                htmlFor="location"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Ubicación
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Ciudad, País"
              />
            </div>

            <div>
              <label
                htmlFor="website"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Sitio web
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder="https://tu-sitio.com"
              />
            </div>

            <div>
              <label
                htmlFor="date_of_birth"
                className={`block text-sm font-medium mb-2 ${
                  isDark ? "text-slate-300" : "text-gray-700"
                }`}
              >
                Fecha de nacimiento
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                  isDark
                    ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>

            {/* Buttons */}
            <div
              className={`flex items-center justify-end gap-3 pt-4 border-t ${
                isDark ? "border-slate-700" : "border-gray-200"
              }`}
            >
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                  isDark
                    ? "text-slate-300 bg-slate-800 hover:bg-slate-700"
                    : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updateProfileMutation.isLoading}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-primary-500/30 transition-all"
              >
                {updateProfileMutation.isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Guardar cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
