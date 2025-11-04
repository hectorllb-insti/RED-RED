"use client";

import {
  Edit2,
  Heart,
  ImageIcon,
  MessageCircle,
  Save,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { securityUtils } from "../utils/security";
import { getImageUrl } from "../utils/imageUtils";

const Home = () => {
  const { user } = useAuth();
  const [newPost, setNewPost] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const queryClient = useQueryClient();

  // Obtener publicaciones del feed
  const { data: posts, isLoading } = useQuery(
    ["posts"],
    async () => {
      const response = await api.get("/posts/");
      return response.data;
    },
    {
      staleTime: 1 * 60 * 1000, // 1 minuto
      refetchOnMount: true, // Recargar cuando vuelvas a la página
      refetchOnWindowFocus: false, // No recargar al cambiar de pestaña
    }
  );

  // Mutation para crear nueva publicación
  const createPostMutation = useMutation(
    async (postData) => {
      const response = await api.post("/posts/", postData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts");
        setNewPost("");
        setShowCreatePost(false);
        toast.success("¡Publicación creada!");
      },
      onError: () => {
        toast.error("Error al crear la publicación");
      },
    }
  );

  // Mutation para dar like/unlike
  const likeMutation = useMutation(
    async (postId) => {
      const response = await api.post(`/posts/${postId}/like/`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts");
      },
    }
  );

  // Mutation para eliminar post
  const deletePostMutation = useMutation(
    async (postId) => {
      await api.delete(`/posts/${postId}/`);
      return postId;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts");
        toast.success("Publicación eliminada");
      },
      onError: () => {
        toast.error("Error al eliminar la publicación");
      },
    }
  );

  // Mutation para editar post
  const editPostMutation = useMutation(
    async ({ postId, content }) => {
      const response = await api.put(`/posts/${postId}/`, { content });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts");
        toast.success("Publicación editada");
      },
      onError: () => {
        toast.error("Error al editar la publicación");
      },
    }
  );

  // Mutation para comentar post
  const commentMutation = useMutation(
    async ({ postId, content }) => {
      const response = await api.post(`/posts/${postId}/comment/`, { content });
      return response.data;
    },
    {
      onSuccess: (_, { postId }) => {
        queryClient.invalidateQueries(["comments", postId]);
        queryClient.invalidateQueries("posts");
        setNewComment({ ...newComment, [postId]: "" });
        toast.success("Comentario agregado");
      },
      onError: () => {
        toast.error("Error al agregar comentario");
      },
    }
  );

  // Mutation para compartir post
  const shareMutation = useMutation(
    async ({ postId, shared_with_username, message }) => {
      const data = { message };
      if (shared_with_username) {
        data.shared_with_username = shared_with_username;
      }
      const response = await api.post(`/posts/${postId}/share/`, data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success(data.message || "¡Publicación compartida!");
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || "Error al compartir");
      },
    }
  );

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (newPost.trim() || selectedImage) {
      try {
        // Validar y sanitizar contenido
        const sanitizedContent = securityUtils.sanitizePost(newPost);

        // Crear FormData si hay imagen
        let postData;
        if (selectedImage) {
          postData = new FormData();
          postData.append("content", sanitizedContent);
          postData.append("image", selectedImage);
        } else {
          postData = { content: sanitizedContent };
        }

        createPostMutation.mutate(postData, {
          onSuccess: () => {
            setNewPost("");
            setSelectedImage(null);
            setImagePreview(null);
            setShowCreatePost(false);
          },
        });
      } catch (error) {
        toast.error("Error: " + error.message);
        return;
      }
    }
  };

  const handleLike = (postId) => {
    likeMutation.mutate(postId);
  };

  const handleDeletePost = (postId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar esta publicación?")
    ) {
      deletePostMutation.mutate(postId);
    }
  };

  const handleStartEdit = (post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    setEditContent("");
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      try {
        const sanitizedContent = securityUtils.sanitizePost(editContent);
        editPostMutation.mutate(
          { postId: editingPost, content: sanitizedContent },
          {
            onSuccess: () => {
              setEditingPost(null);
              setEditContent("");
            },
          }
        );
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const toggleComments = (postId) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId],
    });
  };

  const handleCommentSubmit = (postId) => {
    const content = newComment[postId];
    if (content && content.trim()) {
      try {
        const sanitizedContent = securityUtils.sanitizePost(content);
        commentMutation.mutate({ postId, content: sanitizedContent });
      } catch (error) {
        toast.error("Error: " + error.message);
      }
    }
  };

  const handleCommentChange = (postId, value) => {
    setNewComment({
      ...newComment,
      [postId]: value,
    });
  };

  const handleSharePost = (postId) => {
    const username = prompt(
      "Ingresa el nombre de usuario con quien compartir (o deja vacío para compartir públicamente):"
    );

    // Si el usuario cancela, username será null
    if (username === null) return;

    const message = prompt(
      "¿Quieres agregar un mensaje al compartir? (opcional)"
    );

    // Si el usuario cancela el mensaje también, no compartir
    if (message === null) return;

    const shareData = {
      message: message || "",
    };

    // Solo agregar shared_with_username si se proporcionó
    if (username && username.trim()) {
      shareData.shared_with_username = username.trim();
    }

    shareMutation.mutate({ postId, ...shareData });
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Auto-refresh cada 45 segundos para obtener nuevas publicaciones
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      queryClient.invalidateQueries("posts");
    }, 45000);

    return () => clearInterval(autoRefreshInterval);
  }, [queryClient]);

  if (isLoading) {
    return (
      <LoadingSpinner variant="skeleton" text="Cargando publicaciones..." />
    );
  }

  return (
    <div className="space-y-4 mt-10">
      {/* Tarjeta de crear publicación */}
      <div className="bg-gradient-to-r from-white via-primary-50/20 to-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg hover:border-primary-300 transition-all duration-300 group">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              className="h-11 w-11 rounded-full ring-2 ring-primary-100 object-cover group-hover:ring-primary-300 transition-all"
              src={user?.profile_picture || "/default-avatar.png"}
              alt={user?.full_name}
            />
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full text-gray-600 hover:from-primary-50 hover:to-purple-50 hover:text-primary-700 transition-all text-sm font-medium group-hover:shadow-inner"
          >
            💭 ¿Qué estás pensando, {user?.first_name}?
          </button>
        </div>

        {showCreatePost && (
          <form onSubmit={handleCreatePost} className="mt-5 space-y-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="¿Qué estás pensando?"
              className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-400"
              rows="4"
              autoFocus
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3 relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="max-w-full h-64 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-gray-900/80 text-white rounded-full p-2 hover:bg-gray-900 transition-all backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Foto</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all font-medium"
                >
                  Cancelar
                </button>
              </div>

              <button
                type="submit"
                disabled={
                  (!newPost.trim() && !selectedImage) ||
                  createPostMutation.isLoading
                }
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm shadow-lg shadow-primary-500/30 transition-all hover-lift active:scale-95"
              >
                {createPostMutation.isLoading ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="space-y-6">
        {(() => {
          const postList = Array.isArray(posts?.results)
            ? posts.results
            : Array.isArray(posts)
            ? posts
            : [];

          if (isLoading) {
            return <LoadingSpinner variant="dots" text="Cargando posts..." />;
          }

          if (postList.length === 0) {
            return (
              <EmptyState
                Icon={MessageCircle}
                title="No hay publicaciones"
                description="Sé el primero en compartir algo con la comunidad"
                actionLabel="Crear publicación"
                onAction={() => setShowCreatePost(true)}
              />
            );
          }

          return postList.map((post, index) => (
            <div
              key={post.id}
              className="bg-gradient-to-br from-white via-gray-50/50 to-white rounded-2xl shadow-md border border-gray-200 hover:shadow-lg hover:border-primary-200 transition-all duration-300 stagger-item overflow-hidden"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Post Header con gradiente sutil */}
              <div className="p-4 bg-gradient-to-r from-transparent via-primary-50/20 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    className="h-10 w-10 rounded-full ring-2 ring-primary-100 object-cover"
                    src={getImageUrl(post.author_profile_picture) || "/default-avatar.png"}
                    alt={`${post.author_first_name} ${post.author_last_name}`}
                  />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {post.author_first_name} {post.author_last_name}
                    </p>
                    <p className="text-xs text-primary-600 font-medium">
                      @{post.author_username}
                    </p>
                  </div>
                </div>
                {post.author_id === user?.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(post)}
                      className="text-gray-500 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-all"
                      title="Editar publicación"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                      title="Eliminar publicación"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="px-4 pb-4">
                {editingPost === post.id ? (
                  <div className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none bg-white text-gray-800 placeholder-gray-400 transition-all"
                      rows="3"
                      placeholder="¿Qué estás pensando?"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg flex items-center gap-2 transition-all font-medium"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancelar</span>
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={
                          !editContent.trim() || editPostMutation.isLoading
                        }
                        className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 flex items-center gap-2 font-medium shadow-md transition-all"
                      >
                        <Save className="h-4 w-4" />
                        <span>
                          {editPostMutation.isLoading
                            ? "Guardando..."
                            : "Guardar"}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
                      {post.content}
                    </p>
                    {post.image && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt="Contenido del post"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sección de interacciones */}
              <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`like-button flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all w-14 ${
                      post.is_liked
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md liked"
                        : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 hover:border-red-300 border border-gray-200"
                    }`}
                  >
                    <div style={{ width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Heart
                        className={`transition-colors ${
                          post.is_liked ? "fill-current" : ""
                        }`}
                        strokeWidth={post.is_liked ? 0 : 2}
                        style={{ 
                          width: '18px',
                          height: '18px'
                        }}
                      />
                    </div>
                    <span className="font-medium">
                      {post.likes_count}
                    </span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all w-14 ${
                      showComments[post.id]
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                        : "bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 border border-gray-200"
                    }`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">
                      {post.comments_count}
                    </span>
                  </button>
                  <button
                    onClick={() => handleSharePost(post.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm transition-all bg-white text-gray-600 hover:bg-green-50 hover:text-green-600 hover:border-green-300 border border-gray-200 w-24"
                    title="Compartir publicación"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="font-medium">Compartir</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-full border border-gray-200 shadow-sm">
                  <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-gray-600 font-medium">
                    {new Date(post.created_at).toLocaleDateString()} • {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <CommentsSection
                  postId={post.id}
                  newComment={newComment[post.id] || ""}
                  onCommentChange={handleCommentChange}
                  onCommentSubmit={handleCommentSubmit}
                  isSubmitting={commentMutation.isLoading}
                />
              )}
            </div>
          ));
        })()}
      </div>

      {(() => {
        const postList = Array.isArray(posts?.results)
          ? posts.results
          : Array.isArray(posts)
          ? posts
          : [];
        return (
          postList.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay publicaciones aún</p>
              <p className="text-gray-400">¡Sé el primero en publicar algo!</p>
            </div>
          )
        );
      })()}
    </div>
  );
};

// Componente para la sección de comentarios
const CommentsSection = ({
  postId,
  newComment,
  onCommentChange,
  onCommentSubmit,
  isSubmitting,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query para obtener comentarios del post
  const { data: comments, isLoading } = useQuery(
    ["comments", postId],
    async () => {
      const response = await api.get(`/posts/${postId}/comments/`);
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    }
  );

  // Mutation para dar like/unlike a comentarios con actualización optimista
  const likeCommentMutation = useMutation(
    async (commentId) => {
      const response = await api.post(`/posts/comments/${commentId}/like/`);
      return { commentId, liked: response.data.liked };
    },
    {
      onMutate: async (commentId) => {
        // Cancelar queries en curso
        await queryClient.cancelQueries(["comments", postId]);

        // Snapshot del estado anterior
        const previousComments = queryClient.getQueryData(["comments", postId]);

        // Actualización optimista
        if (previousComments) {
          queryClient.setQueryData(["comments", postId], (old) => {
            return old.map((comment) => {
              if (comment.id === commentId) {
                const newIsLiked = !comment.is_liked;
                const newLikesCount = newIsLiked 
                  ? (comment.likes_count || 0) + 1 
                  : Math.max(0, (comment.likes_count || 0) - 1);
                
                return {
                  ...comment,
                  is_liked: newIsLiked,
                  likes_count: newLikesCount,
                };
              }
              return comment;
            });
          });
        }

        return { previousComments };
      },
      onSuccess: (data, commentId) => {
        // Confirmar el estado con el servidor (solo actualizar is_liked, mantener el contador)
        queryClient.setQueryData(["comments", postId], (old) => {
          if (!old) return old;
          return old.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                is_liked: data.liked,
              };
            }
            return comment;
          });
        });
      },
      onError: (err, commentId, context) => {
        // Revertir en caso de error
        if (context?.previousComments) {
          queryClient.setQueryData(["comments", postId], context.previousComments);
        }
      },
    }
  );

  const handleCommentLike = (commentId) => {
    likeCommentMutation.mutate(commentId);
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50/30">
      {/* Formulario para nuevo comentario */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex space-x-3">
          <img
            className="h-9 w-9 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
            src={user?.profile_picture ? getImageUrl(user.profile_picture) : "/default-avatar.png"}
            alt={user?.full_name || "Tu perfil"}
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => onCommentChange(postId, e.target.value)}
              placeholder="Escribe un comentario..."
              className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white placeholder-gray-400 transition-all"
              rows="2"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => onCommentSubmit(postId)}
                disabled={!newComment.trim() || isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-lg hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
              >
                {isSubmitting ? "Enviando..." : "Comentar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de comentarios */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <LoadingSpinner variant="pulse" size="sm" />
        ) : (
          <div className="space-y-3">
            {comments && comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={comment.id} className="flex space-x-3 group" style={{ animationDelay: `${index * 0.05}s` }}>
                  <img
                    className="h-8 w-8 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-100"
                    src={comment.author_profile_picture ? getImageUrl(comment.author_profile_picture) : "/default-avatar.png"}
                    alt={comment.author_username || "Usuario"}
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 group-hover:border-gray-300 transition-all">
                      <p className="font-semibold text-sm text-gray-900">
                        {comment.author_username}
                      </p>
                      <p className="text-sm text-gray-700 mt-1 break-words">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-2 px-2">
                      <button
                        onClick={() => handleCommentLike(comment.id)}
                        className={`like-button flex items-center gap-1 text-xs font-medium transition-all w-10 ${
                          comment.is_liked
                            ? "text-red-500"
                            : "text-gray-500 hover:text-red-500"
                        }`}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${
                            comment.is_liked ? "fill-current" : ""
                          }`}
                        />
                        <span>{comment.likes_count || 0}</span>
                      </button>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString()} • {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

export default Home;
