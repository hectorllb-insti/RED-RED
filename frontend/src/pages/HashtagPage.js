import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TextWithHashtags } from "../components/HashtagLink";
import { useTheme } from "../context/ThemeContext";
import hashtagService from "../services/hashtagService";
import "./HashtagPage.css";

/**
 * Página de detalle de hashtag con posts relacionados
 */
const HashtagPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const [hashtag, setHashtag] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadHashtagData();
  }, [slug]);

  const loadHashtagData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar detalle del hashtag y posts en paralelo
      const [hashtagData, postsData] = await Promise.all([
        hashtagService.getHashtagDetail(slug),
        hashtagService.getHashtagPosts(slug),
      ]);

      setHashtag(hashtagData);
      setPosts(postsData);
    } catch (err) {
      console.error("Error al cargar hashtag:", err);
      setError("Error al cargar el hashtag. Puede que no exista.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "hace unos segundos";
    if (diffInSeconds < 3600)
      return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400)
      return `hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800)
      return `hace ${Math.floor(diffInSeconds / 86400)} d`;

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
  };

  const handleUserClick = (e, username) => {
    e.stopPropagation();
    navigate(`/profile/${username}`);
  };

  if (loading) {
    return (
      <div className={`hashtag-page ${isDark ? "dark-mode" : ""}`}>
        <div className="hashtag-loading">
          <div className="spinner"></div>
          <p>Cargando hashtag...</p>
        </div>
      </div>
    );
  }

  if (error || !hashtag) {
    return (
      <div className={`hashtag-page ${isDark ? "dark-mode" : ""}`}>
        <div className="hashtag-error">
          <h2>❌ {error || "Hashtag no encontrado"}</h2>
          <button onClick={handleBackClick} className="back-button">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`hashtag-page ${isDark ? "dark-mode" : ""}`}>
      {/* Header */}
      <div className="hashtag-header">
        <button onClick={handleBackClick} className="back-button">
          ← Volver
        </button>
        <div className="hashtag-info">
          <h1>#{hashtag.name}</h1>
          <div className="hashtag-meta">
            <span className="usage-count">
              {hashtag.usage_count}{" "}
              {hashtag.usage_count === 1 ? "publicación" : "publicaciones"}
            </span>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="hashtag-posts">
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No hay publicaciones con este hashtag aún</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="post-card"
              onClick={() => handlePostClick(post.id)}
            >
              <div className="post-header">
                <img
                  src={post.author_profile_picture || "/default-avatar.png"}
                  alt={post.author_username}
                  className="post-avatar"
                  onClick={(e) => handleUserClick(e, post.author_username)}
                />
                <div className="post-author-info">
                  <span
                    className="post-author"
                    onClick={(e) => handleUserClick(e, post.author_username)}
                  >
                    {post.author_first_name} {post.author_last_name}
                  </span>
                  <span className="post-username">@{post.author_username}</span>
                  <span className="post-date">
                    · {formatDate(post.created_at)}
                  </span>
                </div>
              </div>

              <div className="post-content">
                <TextWithHashtags text={post.content} />
              </div>

              {post.image && (
                <div className="post-image-container">
                  <img src={post.image} alt="Post" className="post-image" />
                </div>
              )}

              <div className="post-stats">
                <span className="stat">❤️ {post.likes_count}</span>
                <span className="stat">💬 {post.comments_count}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HashtagPage;
