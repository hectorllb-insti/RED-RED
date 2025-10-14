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
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
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
  const { data: posts, isLoading } = useQuery("posts", async () => {
    const response = await api.get("/posts/");
    return response.data;
  });

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <img
            className="h-10 w-10 rounded-full"
            src={user?.profile_picture || "/default-avatar.png"}
            alt={user?.full_name}
          />
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left px-4 py-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            ¿Qué estás pensando, {user?.first_name}?
          </button>
        </div>

        {showCreatePost && (
          <form onSubmit={handleCreatePost} className="mt-4 space-y-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="¿Qué estás pensando?"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows="3"
              autoFocus
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-3 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center mt-3">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex items-center space-x-1 text-gray-500 hover:text-primary-600"
                >
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-sm">Foto</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
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
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPostMutation.isLoading ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {(() => {
          const postList = Array.isArray(posts?.results)
            ? posts.results
            : Array.isArray(posts)
            ? posts
            : [];
          return postList.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={post.author.profile_picture || "/default-avatar.png"}
                    alt={post.author.full_name}
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {post.author.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      @{post.author.username}
                    </p>
                  </div>
                </div>
                {post.author.id === user?.id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStartEdit(post)}
                      className="text-gray-400 hover:text-blue-600 p-1"
                      title="Editar publicación"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-gray-400 hover:text-red-600 p-1"
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
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows="3"
                      placeholder="¿Qué estás pensando?"
                    />
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancelar</span>
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={
                          !editContent.trim() || editPostMutation.isLoading
                        }
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-1"
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
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {post.content}
                    </p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Contenido del post"
                        className="mt-3 rounded-lg max-w-full h-auto"
                      />
                    )}
                  </>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 ${
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
                    <span className="text-sm">{post.likes_count}</span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">{post.comments_count}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500">
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm">Compartir</span>
                  </button>
                </div>
                <span className="text-xs text-gray-400">
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
            className="h-8 w-8 rounded-full"
            src={user?.profile_picture || "/default-avatar.png"}
            alt={user?.full_name}
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
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={
                      comment.author.profile_picture || "/default-avatar.png"
                    }
                    alt={comment.author.full_name}
                  />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-sm text-gray-900">
                        {comment.author.full_name}
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
