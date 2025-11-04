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
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getImageUrl } from "../utils/imageUtils";
import { securityUtils } from "../utils/security";

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

  if (isLoading) {
    return (
      <LoadingSpinner variant="skeleton" text="Cargando publicaciones..." />
    );
  }

  return (
    <div className="space-y-6 mt-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <img
            className="h-11 w-11 rounded-full ring-2 ring-gray-100"
            src={user?.profile_picture || "/default-avatar.png"}
            alt={user?.full_name}
          />
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left px-5 py-3 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-all text-sm font-medium"
          >
            ¿Qué estás pensando, {user?.first_name}?
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
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
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
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm shadow-lg shadow-primary-500/30 transition-all"
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

          return postList.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Post Header */}
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    className="h-11 w-11 rounded-full ring-2 ring-gray-100 object-cover"
                    src={
                      getImageUrl(post.author_profile_picture) ||
                      "/default-avatar.png"
                    }
                    alt={`${post.author_first_name} ${post.author_last_name}`}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {post.author_first_name} {post.author_last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      @{post.author_username}
                    </p>
                  </div>
                </div>
                {post.author_id === user?.id && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEdit(post)}
                      className="text-gray-400 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-lg transition-all"
                      title="Editar publicación"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                      title="Eliminar publicación"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Post Content */}
              <div className="px-5 pb-4">
                {editingPost === post.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-gray-50"
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
                        className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 flex items-center gap-2 font-semibold shadow-lg shadow-primary-500/30 transition-all"
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
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </p>
                    {post.image && (
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt="Contenido del post"
                        className="mt-4 rounded-xl max-w-full h-auto"
                      />
                    )}
                  </>
                )}
              </div>

              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 transition-all ${
                      post.is_liked
                        ? "text-red-500"
                        : "text-gray-500 hover:text-red-500"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        post.is_liked ? "fill-current" : ""
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {post.likes_count}
                    </span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-all"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {post.comments_count}
                    </span>
                  </button>
                  <button
                    onClick={() => handleSharePost(post.id)}
                    className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-all"
                    title="Compartir publicación"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Compartir</span>
                  </button>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
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

  // Query para obtener comentarios del post
  const { data: comments, isLoading } = useQuery(
    ["comments", postId],
    async () => {
      const response = await api.get(`/posts/${postId}/comments/`);
      return response.data;
    }
  );

  return (
    <div className="border-t border-gray-100">
      {/* Formulario para nuevo comentario */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex space-x-3">
          <img
            className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-gray-200"
            src={
              user?.profile_picture
                ? getImageUrl(user.profile_picture)
                : "/default-avatar.png"
            }
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
              className="w-full p-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="2"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => onCommentSubmit(postId)}
                disabled={!newComment.trim() || isSubmitting}
                className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? "Enviando..." : "Comentar"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de comentarios */}
      <div className="p-4">
        {isLoading ? (
          <LoadingSpinner variant="pulse" size="sm" />
        ) : (
          <div className="space-y-3">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <img
                    className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-gray-200"
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
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-sm text-gray-900">
                        {comment.author_username}
                      </p>
                      <p className="text-sm text-gray-800 mt-1">
                        {comment.content}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comment.created_at).toLocaleDateString()} a las{" "}
                      {new Date(comment.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No hay comentarios aún. ¡Sé el primero en comentar!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
