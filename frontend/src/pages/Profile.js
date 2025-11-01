"use client";

import { Camera, ChevronDown, ChevronUp, Heart, MessageCircle, Settings, UserMinus, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ProfileEdit from "../components/ProfileEdit";
import { useAuth } from "../context/AuthContext";
import { tokenManager } from "../services/tokenManager";
import { getImageUrl } from "../utils/imageUtils";
import api from "../services/api";

const API_BASE_URL = "http://localhost:8000/api";

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("posts");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showComments, setShowComments] = useState({});

  // Si no hay userId, mostrar perfil del usuario actual
  const isOwnProfile =
    !userId ||
    userId === currentUser?.id?.toString() ||
    userId === currentUser?.username;
  const profileIdentifier = userId || currentUser?.id;

  // Obtener datos del perfil
  const { data: profileUser, isLoading, refetch: refetchProfile } = useQuery(
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
      retry: 1
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
      retry: 1
    }
  );

  // Función para alternar la visibilidad de comentarios
  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
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
        retry: 1
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
  }, [profileIdentifier, refetchProfile, refetchPosts, profileUser?.username, queryClient]);

  // Efecto para polling automático cada 30 segundos
  useEffect(() => {
    const autoRefreshData = async () => {
      try {
        const token = tokenManager.getToken();
        if (!token) return;

        // Actualizar posts del usuario
        if (profileUser?.username) {
          const response = await fetch(
            `${API_BASE_URL}/posts/user/${profileUser.username}/`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            // Actualizar cache de React Query con los nuevos datos
            queryClient.setQueryData(["userPosts", profileUser.username], data);
          }
        }

        // Actualizar comentarios de posts visibles
        const visiblePostIds = Object.keys(showComments).filter(
          (postId) => showComments[postId]
        );

        for (const postId of visiblePostIds) {
          const response = await fetch(
            `${API_BASE_URL}/posts/${postId}/comments/`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const comments = await response.json();
            queryClient.setQueryData(["comments", parseInt(postId)], comments);
          }
        }
      } catch (error) {
        // Error silencioso en auto-refresh
      }
    };

    autoRefreshData();
    const intervalId = setInterval(autoRefreshData, 30000);

    return () => clearInterval(intervalId);
  }, [profileUser?.username, showComments, queryClient]);

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
        throw new Error(errorData.error || "Error al actualizar el seguimiento");
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

  if (isLoading) {
    return (
      <LoadingSpinner variant="spinner" text="Cargando perfil..." fullScreen />
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-10">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Cover Photo */}
        <div className="h-52 bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 relative">
          {profileUser.cover_picture && (
            <img
              src={profileUser.cover_picture || "/placeholder.svg"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          {isOwnProfile && (
            <button className="absolute top-4 right-4 p-2.5 bg-gray-900/60 backdrop-blur-sm rounded-xl text-white hover:bg-gray-900/80 transition-all">
              <Camera className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-start justify-between -mt-20">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  className="h-36 w-36 rounded-2xl border-4 border-white shadow-xl ring-2 ring-gray-100"
                  src={profileUser.profile_picture || "/default-avatar.png"}
                  alt={profileUser.full_name}
                />
                {isOwnProfile && (
                  <button className="absolute bottom-2 right-2 p-2 bg-primary-600 rounded-xl text-white shadow-lg hover:bg-primary-700 transition-all">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profileUser.full_name}
                </h1>
                <p className="text-gray-600 font-medium">
                  @{profileUser.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-20">
              {isOwnProfile ? (
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  <Settings className="h-4 w-4" />
                  <span>Editar perfil</span>
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followMutation.isLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${
                    profileUser.is_following
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
            <p className="mt-5 text-gray-700 leading-relaxed">
              {profileUser.bio}
            </p>
          )}

          <div className="flex items-center gap-8 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {userPosts?.count || 0}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Publicaciones
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {profileUser.followers_count || 0}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Seguidores
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {profileUser.following_count || 0}
              </p>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Siguiendo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {["posts", "about"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                  activeTab === tab
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab === "posts" ? "Publicaciones" : "Acerca de"}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "posts" && (
            <div className="space-y-5">
              {userPosts?.results?.map((post) => (
                <div
                  key={post.id}
                  className="border-b border-gray-100 pb-5 last:border-b-0"
                >
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                  {post.image && (
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Post"
                      className="mt-3 rounded-xl max-w-full h-auto"
                    />
                  )}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full">
                        <Heart className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">{post.likes_count}</span>
                      </div>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold text-sm transition-all ${
                          showComments[post.id]
                            ? "bg-primary-100 text-primary-700"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments_count}</span>
                        {showComments[post.id] ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(post.created_at).toLocaleDateString()}
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
                <p className="text-gray-500 text-center py-12 font-medium">
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
                <h3 className="font-medium text-gray-900 mb-2">Información</h3>
                <div className="space-y-2 text-sm">
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
                        className="text-primary-600 hover:underline ml-1"
                      >
                        {profileUser.website}
                      </a>
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Se unió:</span>
                    {new Date(profileUser.created_at).toLocaleDateString()}
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const { data: comments, isLoading, refetch } = usePostComments(postId);

  // Mutation para crear comentario
  const commentMutation = useMutation(
    async (commentData) => {
      const response = await api.post(`/posts/${postId}/comment/`, commentData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments", postId]);
        queryClient.invalidateQueries(["userPosts"]);
        setNewComment("");
        toast.success("Comentario publicado");
        refetch();
      },
      onError: () => {
        toast.error("Error al publicar el comentario");
      },
    }
  );

  // Mutation para dar like/unlike a comentarios
  const likeCommentMutation = useMutation(
    async (commentId) => {
      const response = await api.post(`/posts/comments/${commentId}/like/`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["comments", postId]);
        refetch();
      },
    }
  );

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    commentMutation.mutate({ content: newComment });
  };

  const handleCommentLike = (commentId) => {
    likeCommentMutation.mutate(commentId);
  };

  return (
    <div className="mt-3 border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white rounded-b-lg">
      {/* Formulario para nuevo comentario */}
      <div className="p-5 border-b border-gray-200 bg-white">
        <div className="flex space-x-3">
          <img
            className="h-10 w-10 rounded-full object-cover flex-shrink-0 ring-2 ring-primary-100"
            src={user?.profile_picture ? getImageUrl(user.profile_picture) : "/default-avatar.png"}
            alt={user?.full_name || "Tu perfil"}
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe un comentario..."
              className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 placeholder-gray-400 transition-all"
              rows="2"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleCommentSubmit}
                disabled={!newComment.trim() || commentMutation.isLoading}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold rounded-lg hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary-500/30 transition-all"
              >
                {commentMutation.isLoading ? "Enviando..." : "Comentar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de comentarios */}
      <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner variant="pulse" size="sm" />
          </div>
        ) : (
          <div className="space-y-4">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 group">
                  <img
                    className="h-9 w-9 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                    src={comment.author_profile_picture ? getImageUrl(comment.author_profile_picture) : "/default-avatar.png"}
                    alt={comment.author_username || "Usuario"}
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 group-hover:shadow-md transition-all">
                      <p className="font-semibold text-sm text-gray-900">
                        {comment.author_username}
                      </p>
                      <p className="text-sm text-gray-700 mt-1 break-words">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 px-2">
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        className={`flex items-center gap-1 text-xs font-medium transition-all ${
                          comment.is_liked
                            ? "text-red-500"
                            : "text-gray-500 hover:text-red-500"
                        }`}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            comment.is_liked ? "fill-current" : ""
                          }`}
                        />
                        <span>{comment.likes_count || 0}</span>
                      </button>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString()} •{" "}
                        {new Date(comment.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">
                  No hay comentarios aún
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  ¡Sé el primero en comentar!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
