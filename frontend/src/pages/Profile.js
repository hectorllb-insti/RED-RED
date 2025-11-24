"use client";

import {
  Camera,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageCircle,
  Settings,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ProfileEdit from "../components/ProfileEdit";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";
import { tokenManager } from "../services/tokenManager";
import {
  formatDate,
  formatDateShort,
  formatDateTime,
} from "../utils/dateUtils";
import { getImageUrl } from "../utils/imageUtils";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { actualTheme } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("posts");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showComments, setShowComments] = useState({});
  const profilePictureInputRef = useRef(null);
  const coverPictureInputRef = useRef(null);

  const isDark = actualTheme === "dark";

  // Si no hay userId, mostrar perfil del usuario actual
  const isOwnProfile =
    !userId ||
    userId === currentUser?.id?.toString() ||
    userId === currentUser?.username;
  const profileIdentifier = userId || currentUser?.id;

  // Obtener datos del perfil
  const {
    data: profileUser,
    isLoading,
    refetch: refetchProfile,
  } = useQuery(
    ["profile", profileIdentifier],
    async () => {
      const token = tokenManager.getToken();
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      if (isOwnProfile) {
        const response = await fetch(`${API_BASE_URL}/users/profile/`, {
          headers,
        });
        if (!response.ok) {
          throw new Error("Error al obtener el perfil");
        }
        return await response.json();
      } else {
        // Intentar por ID primero, si falla por username
        try {
          const response = await fetch(
            `${API_BASE_URL}/users/${profileIdentifier}/`,
            { headers }
          );
          if (!response.ok) {
            throw new Error("Error al obtener el perfil");
          }
          return await response.json();
        } catch (error) {
          if (error.response?.status === 404 && isNaN(profileIdentifier)) {
            // Si el identificador no es numérico, podría ser un username
            const response = await fetch(
              `${API_BASE_URL}/users/${profileIdentifier}/`,
              { headers }
            );
            if (!response.ok) {
              throw new Error("Error al obtener el perfil");
            }
            return await response.json();
          }
          throw error;
        }
      }
    },
    {
      staleTime: 0, // Considerar datos como obsoletos inmediatamente
      refetchOnMount: true, // Recargar cuando el componente se monta
      refetchOnWindowFocus: true, // Recargar cuando se enfoca la ventana
      retry: 1,
    }
  );

  // Obtener publicaciones del usuario
  const { data: userPosts, refetch: refetchPosts } = useQuery(
    ["userPosts", profileUser?.username],
    async () => {
      if (profileUser?.username) {
        const token = tokenManager.getToken();
        const response = await fetch(
          `${API_BASE_URL}/posts/user/${profileUser.username}/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error al obtener las publicaciones");
        }
        return await response.json();
      }
      return [];
    },
    {
      enabled: !!profileUser?.username,
      staleTime: 0, // Considerar datos como obsoletos inmediatamente
      refetchOnMount: true, // Recargar cuando el componente se monta
      refetchOnWindowFocus: false, // No recargar automáticamente al enfocar
      retry: 1,
    }
  );

  // Función para alternar la visibilidad de comentarios
  const toggleComments = (postId) => {
    setShowComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Query para obtener comentarios de un post específico
  const usePostComments = (postId) => {
    return useQuery(
      ["comments", postId],
      async () => {
        const response = await api.get(`/posts/${postId}/comments/`);
        return response.data;
      },
      {
        enabled: showComments[postId], // Solo cargar cuando el dropdown esté abierto
        staleTime: 0, // Considerar datos como obsoletos inmediatamente
        refetchOnMount: true, // Recargar cuando el componente se monta
        refetchOnWindowFocus: false, // No recargar automáticamente al enfocar
        retry: 1,
      }
    );
  };

  // Efecto para recargar datos cuando se entra a la página
  useEffect(() => {
    const reloadProfileData = async () => {
      try {
        // Recargar perfil
        await refetchProfile();

        // Recargar posts si ya hay datos del perfil
        if (profileUser?.username) {
          await refetchPosts();
        }

        // Invalidar todas las queries de comentarios para forzar recarga
        queryClient.invalidateQueries(["comments"]);
      } catch (error) {
        console.error("Error recargando datos del perfil:", error);
      }
    };

    // Ejecutar la recarga cuando el componente se monta o cambia el profileIdentifier
    reloadProfileData();
  }, [
    profileIdentifier,
    refetchProfile,
    refetchPosts,
    profileUser?.username,
    queryClient,
  ]);

  // Función para recargar comentarios específicos
  const refreshComments = async (postId) => {
    try {
      await queryClient.invalidateQueries(["comments", postId]);
      await queryClient.refetchQueries(["comments", postId]);
    } catch (error) {
      console.error("Error recargando comentarios:", error);
    }
  };

  // Mutation para seguir/dejar de seguir usuario
  const followMutation = useMutation(
    async () => {
      const token = tokenManager.getToken();
      const endpoint = profileUser.is_following
        ? `${API_BASE_URL}/users/unfollow/${profileUser.username}/`
        : `${API_BASE_URL}/users/follow/${profileUser.username}/`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al actualizar el seguimiento"
        );
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["profile", profileIdentifier]);
        queryClient.invalidateQueries(["posts"]); // Recargar feed de posts
        toast.success(
          profileUser?.is_following
            ? "Dejaste de seguir a este usuario"
            : "Ahora sigues a este usuario"
        );
      },
      onError: (error) => {
        toast.error(error.message || "Error al actualizar el seguimiento");
      },
    }
  );

  const handleFollow = () => {
    followMutation.mutate();
  };

  // Mutation para actualizar la imagen de perfil
  const updateProfilePictureMutation = useMutation(
    async (file) => {
      const formData = new FormData();
      formData.append("profile_picture", file);

      const token = tokenManager.getToken();
      const response = await fetch(`${API_BASE_URL}/users/profile/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la imagen de perfil");
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["profile", profileIdentifier]);
        toast.success("Imagen de perfil actualizada");
      },
      onError: (error) => {
        toast.error(error.message || "Error al actualizar la imagen de perfil");
      },
    }
  );

  // Mutation para actualizar la imagen de portada
  const updateCoverPictureMutation = useMutation(
    async (file) => {
      const formData = new FormData();
      formData.append("cover_picture", file);

      const token = tokenManager.getToken();
      const response = await fetch(`${API_BASE_URL}/users/profile/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la imagen de portada");
      }

      return await response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["profile", profileIdentifier]);
        toast.success("Imagen de portada actualizada");
      },
      onError: (error) => {
        toast.error(
          error.message || "Error al actualizar la imagen de portada"
        );
      },
    }
  );

  // Handler para cambiar la imagen de perfil
  const handleProfilePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor selecciona una imagen válida");
        return;
      }
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar los 5MB");
        return;
      }
      updateProfilePictureMutation.mutate(file);
    }
  };

  // Handler para cambiar la imagen de portada
  const handleCoverPictureChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor selecciona una imagen válida");
        return;
      }
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no debe superar los 5MB");
        return;
      }
      updateCoverPictureMutation.mutate(file);
    }
  };

  // Mutation para dar like/unlike a publicaciones
  const likeMutation = useMutation(
    async (postId) => {
      const response = await api.post(`/posts/${postId}/like/`);
      return response.data;
    },
    {
      onMutate: async (postId) => {
        // Cancelar queries pendientes
        await queryClient.cancelQueries(["userPosts", profileUser?.username]);

        // Snapshot del valor anterior
        const previousPosts = queryClient.getQueryData([
          "userPosts",
          profileUser?.username,
        ]);

        // Actualización optimista
        queryClient.setQueryData(
          ["userPosts", profileUser?.username],
          (old) => {
            if (!old?.results) return old;

            return {
              ...old,
              results: old.results.map((post) => {
                if (post.id === postId) {
                  const currentlyLiked = post.is_liked || false;
                  return {
                    ...post,
                    is_liked: !currentlyLiked,
                    likes_count: currentlyLiked
                      ? Math.max(0, post.likes_count - 1)
                      : post.likes_count + 1,
                  };
                }
                return post;
              }),
            };
          }
        );

        return { previousPosts };
      },
      onError: (err, postId, context) => {
        // Revertir en caso de error
        queryClient.setQueryData(
          ["userPosts", profileUser?.username],
          context.previousPosts
        );
      },
      onSettled: () => {
        // Refetch para sincronizar con el servidor
        queryClient.invalidateQueries(["userPosts", profileUser?.username]);
      },
    }
  );

  const handleLike = (postId) => {
    likeMutation.mutate(postId);
  };

  if (isLoading) {
    return (
      <LoadingSpinner variant="spinner" text="Cargando perfil..." fullScreen />
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-12">
        <p className={isDark ? "text-slate-400" : "text-gray-500"}>
          Usuario no encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 mt-10">
      {/* Profile Header */}
      <div
        className={`rounded-xl shadow-md border overflow-hidden ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
      >
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 relative">
          {profileUser.cover_picture && (
            <img
              src={profileUser.cover_picture || "/placeholder.svg"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          {isOwnProfile && (
            <>
              <input
                type="file"
                ref={coverPictureInputRef}
                onChange={handleCoverPictureChange}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => coverPictureInputRef.current?.click()}
                disabled={updateCoverPictureMutation.isLoading}
                className={`absolute top-4 right-4 p-2 backdrop-blur-sm rounded-lg text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDark
                    ? "bg-slate-900/70 hover:bg-slate-900/90"
                    : "bg-gray-900/60 hover:bg-gray-900/80"
                  }`}
                title="Cambiar imagen de portada"
              >
                {updateCoverPictureMutation.isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-5">
          <div className="flex items-start justify-between -mt-16">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  className={`h-32 w-32 rounded-xl border-4 shadow-lg ring-2 ${isDark
                      ? "border-slate-800 ring-slate-700"
                      : "border-white ring-gray-100"
                    }`}
                  src={profileUser.profile_picture || "/default-avatar.png"}
                  alt={profileUser.full_name}
                />
                {isOwnProfile && (
                  <>
                    <input
                      type="file"
                      ref={profilePictureInputRef}
                      onChange={handleProfilePictureChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => profilePictureInputRef.current?.click()}
                      disabled={updateProfilePictureMutation.isLoading}
                      className="absolute bottom-2 right-2 p-2 bg-primary-600 rounded-lg text-white shadow-md hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Cambiar imagen de perfil"
                    >
                      {updateProfilePictureMutation.isLoading ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                  </>
                )}
              </div>
              <div className="pb-1">
                <h1
                  className={`text-2xl font-bold mb-1 ${isDark ? "text-slate-100" : "text-gray-900"
                    }`}
                >
                  {profileUser.full_name ||
                    profileUser.first_name + " " + profileUser.last_name ||
                    profileUser.username}
                </h1>
                <p
                  className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"
                    }`}
                >
                  @{profileUser.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-16">
              {isOwnProfile ? (
                <button
                  onClick={() => setShowEditProfile(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium text-sm ${isDark
                      ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Editar perfil</span>
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followMutation.isLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${profileUser.is_following
                      ? isDark
                        ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/30"
                    } disabled:opacity-50`}
                >
                  {profileUser.is_following ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      <span>Dejar de seguir</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Bio */}
          {profileUser.bio && (
            <p
              className={`mt-5 leading-relaxed ${isDark ? "text-slate-300" : "text-gray-700"
                }`}
            >
              {profileUser.bio}
            </p>
          )}

          <div
            className={`flex items-center gap-6 mt-5 pt-4 border-t ${isDark ? "border-slate-700" : "border-gray-100"
              }`}
          >
            <div className="text-center">
              <p
                className={`text-xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"
                  }`}
              >
                {userPosts?.count || 0}
              </p>
              <p
                className={`text-xs font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-gray-500"
                  }`}
              >
                Publicaciones
              </p>
            </div>
            <div className="text-center">
              <p
                className={`text-xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"
                  }`}
              >
                {profileUser.followers_count || 0}
              </p>
              <p
                className={`text-xs font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-gray-500"
                  }`}
              >
                Seguidores
              </p>
            </div>
            <div className="text-center">
              <p
                className={`text-xl font-bold ${isDark ? "text-slate-100" : "text-gray-900"
                  }`}
              >
                {profileUser.following_count || 0}
              </p>
              <p
                className={`text-xs font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-gray-500"
                  }`}
              >
                Siguiendo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`rounded-xl shadow-md border ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"
          }`}
      >
        <div
          className={`border-b ${isDark
              ? "border-slate-700 bg-slate-800/50"
              : "border-gray-200 bg-gray-50/50"
            }`}
        >
          <nav className="flex">
            {["posts", "about"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all ${activeTab === tab
                    ? isDark
                      ? "border-primary-500 text-primary-400 bg-slate-800"
                      : "border-primary-600 text-primary-600 bg-white"
                    : isDark
                      ? "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {tab === "posts" ? "Publicaciones" : "Acerca de"}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "posts" && (
            <div className="space-y-4">
              {userPosts?.results?.map((post, index) => (
                <div
                  key={post.id}
                  className={`rounded-2xl shadow-sm border p-5 hover:shadow-md transition-all stagger-item ${isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-gray-200"
                    }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <p
                    className={`whitespace-pre-wrap leading-relaxed text-[15px] ${isDark ? "text-slate-200" : "text-gray-800"
                      }`}
                  >
                    {post.content}
                  </p>
                  {post.image && (
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Post"
                      className={`mt-4 rounded-xl max-w-full h-auto border ${isDark ? "border-slate-700" : "border-gray-100"
                        }`}
                    />
                  )}
                  <div
                    className={`flex items-center justify-between mt-4 pt-4 border-t ${isDark ? "border-slate-700" : "border-gray-100"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => !isOwnProfile && handleLike(post.id)}
                        disabled={isOwnProfile}
                        className={`like-button flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm transition-all ${post.is_liked
                            ? isDark
                              ? "bg-red-900/30 text-red-400 liked"
                              : "bg-red-50 text-red-600 liked"
                            : isDark
                              ? "bg-slate-700 text-slate-300"
                              : "bg-gray-100 text-gray-700"
                          } ${!isOwnProfile
                            ? isDark
                              ? "hover:bg-red-900/30 hover:text-red-400 hover-scale cursor-pointer"
                              : "hover:bg-red-50 hover:text-red-600 hover-scale cursor-pointer"
                            : "cursor-default opacity-75"
                          }`}
                      >
                        <Heart
                          className={`h-4 w-4 transition-all ${post.is_liked ? "fill-current" : ""
                            }`}
                        />
                        <span>{post.likes_count}</span>
                      </button>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm transition-all hover-scale ${showComments[post.id]
                            ? isDark
                              ? "bg-primary-900/30 text-primary-400"
                              : "bg-primary-100 text-primary-700"
                            : isDark
                              ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        <MessageCircle className="h-4 w-4 transition-transform" />
                        <span>{post.comments_count}</span>
                        {showComments[post.id] ? (
                          <ChevronUp className="h-3.5 w-3.5 transition-transform" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 transition-transform" />
                        )}
                      </button>
                    </div>
                    <span
                      className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-gray-500"
                        }`}
                    >
                      {formatDateShort(post.created_at)}
                    </span>
                  </div>

                  {/* Dropdown de comentarios */}
                  {showComments[post.id] && (
                    <CommentsDropdown
                      postId={post.id}
                      usePostComments={usePostComments}
                      refreshComments={refreshComments}
                    />
                  )}
                </div>
              ))}
              {(!userPosts?.results || userPosts.results.length === 0) && (
                <p
                  className={`text-center py-12 font-medium ${isDark ? "text-slate-400" : "text-gray-500"
                    }`}
                >
                  {isOwnProfile
                    ? "Aún no has publicado nada"
                    : "Este usuario no ha publicado nada"}
                </p>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4">
              <div>
                <h3
                  className={`font-medium mb-2 ${isDark ? "text-slate-100" : "text-gray-900"
                    }`}
                >
                  Información
                </h3>
                <div
                  className={`space-y-2 text-sm ${isDark ? "text-slate-300" : "text-gray-700"
                    }`}
                >
                  {profileUser.location && (
                    <p>
                      <span className="font-medium">Ubicación:</span>{" "}
                      {profileUser.location}
                    </p>
                  )}
                  {profileUser.website && (
                    <p>
                      <span className="font-medium">Sitio web:</span>
                      <a
                        href={profileUser.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`ml-1 hover:underline ${isDark ? "text-primary-400" : "text-primary-600"
                          }`}
                      >
                        {profileUser.website}
                      </a>
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Se unió:</span>{" "}
                    {formatDate(profileUser.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showEditProfile && (
        <ProfileEdit onClose={() => setShowEditProfile(false)} />
      )}
    </div>
  );
};

// Componente para mostrar los comentarios en dropdown
const CommentsDropdown = ({ postId, usePostComments, refreshComments }) => {
  // Estas variables están aquí para futuro uso (añadir comentarios, etc)
  // eslint-disable-next-line no-unused-vars
  const { user } = useAuth();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  // eslint-disable-next-line no-unused-vars
  const queryClient = useQueryClient();
  // eslint-disable-next-line no-unused-vars
  const [newComment, setNewComment] = useState("");
  const { data: comments, isLoading, refetch } = usePostComments(postId);

  // Función para recargar comentarios
  const handleRefresh = async () => {
    try {
      await refetch();
      if (refreshComments) {
        await refreshComments(postId);
      }
    } catch (error) {
      console.error("Error recargando comentarios:", error);
    }
  };

  if (isLoading) {
    return (
      <div
        className={`mt-3 p-4 rounded-lg ${isDark ? "bg-slate-700" : "bg-gray-50"
          }`}
      >
        <div className="flex items-center justify-center">
          <LoadingSpinner variant="pulse" size="sm" />
          <span
            className={`ml-2 text-sm ${isDark ? "text-slate-300" : "text-gray-600"
              }`}
          >
            Cargando comentarios...
          </span>
        </div>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div
        className={`mt-3 p-4 rounded-lg ${isDark ? "bg-slate-700" : "bg-gray-50"
          }`}
      >
        <div className="flex items-center justify-between">
          <p
            className={`text-sm ${isDark ? "text-slate-300" : "text-gray-500"
              }`}
          >
            No hay comentarios en esta publicación
          </p>
          <button
            onClick={handleRefresh}
            className={`text-sm font-medium ${isDark
                ? "text-primary-400 hover:text-primary-300"
                : "text-blue-600 hover:text-blue-800"
              }`}
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mt-3 rounded-lg ${isDark ? "bg-slate-700" : "bg-gray-50"
        }`}
    >
      {/* Header con botón de recarga */}
      <div
        className={`p-3 border-b flex items-center justify-between ${isDark ? "border-slate-600" : "border-gray-200"
          }`}
      >
        <span
          className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-700"
            }`}
        >
          {comments.length} comentario{comments.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={handleRefresh}
          className={`text-sm font-medium ${isDark
              ? "text-primary-400 hover:text-primary-300"
              : "text-blue-600 hover:text-blue-800"
            }`}
        >
          Recargar
        </button>
      </div>

      {/* Lista de comentarios */}
      <div
        className={`divide-y ${isDark ? "divide-slate-600" : "divide-gray-200"
          }`}
      >
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 flex space-x-3">
            <img
              className={`h-8 w-8 rounded-full object-cover flex-shrink-0 border ${isDark ? "border-slate-600" : "border-gray-200"
                }`}
              src={
                comment.author_profile_picture
                  ? getImageUrl(comment.author_profile_picture)
                  : "/default-avatar.png"
              }
              alt={comment.author_username || "Usuario"}
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />
            <div className="flex-1 min-w-0">
              <div
                className={`rounded-lg p-3 shadow-sm ${isDark ? "bg-slate-800" : "bg-white"
                  }`}
              >
                <p
                  className={`font-medium text-sm ${isDark ? "text-slate-100" : "text-gray-900"
                    }`}
                >
                  {comment.author_username}
                </p>
                <p
                  className={`text-sm mt-1 ${isDark ? "text-slate-300" : "text-gray-800"
                    }`}
                >
                  {comment.content}
                </p>
              </div>
              <p
                className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-gray-500"
                  }`}
              >
                {formatDateTime(comment.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
