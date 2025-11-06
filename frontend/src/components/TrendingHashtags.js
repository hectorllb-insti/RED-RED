import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import hashtagService from "../services/hashtagService";
import "./TrendingHashtags.css";

/**
 * Componente para mostrar hashtags en tendencia
 */
const TrendingHashtags = ({ limit = 10, showTitle = true }) => {
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTrendingHashtags();

    // Actualizar cada 5 minutos
    const interval = setInterval(loadTrendingHashtags, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadTrendingHashtags = async () => {
    try {
      setLoading(true);
      const data = await hashtagService.getTrendingHashtags();
      setHashtags(data.slice(0, limit));
      setError(null);
    } catch (err) {
      console.error("Error al cargar hashtags en tendencia:", err);
      setError("Error al cargar tendencias");
    } finally {
      setLoading(false);
    }
  };

  const handleHashtagClick = (slug) => {
    navigate(`/hashtags/${slug}`);
  };

  if (loading && hashtags.length === 0) {
    return (
      <div className="trending-hashtags">
        {showTitle && <h3>🔥 Tendencias</h3>}
        <div className="trending-loading">
          <div className="spinner"></div>
          <p>Cargando tendencias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trending-hashtags">
        {showTitle && <h3>🔥 Tendencias</h3>}
        <div className="trending-error">
          <p>{error}</p>
          <button onClick={loadTrendingHashtags}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (hashtags.length === 0) {
    return (
      <div className="trending-hashtags">
        {showTitle && <h3>🔥 Tendencias</h3>}
        <div className="trending-empty">
          <p>No hay tendencias disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trending-hashtags">
      {showTitle && <h3>🔥 Tendencias</h3>}
      <div className="hashtag-list">
        {hashtags.map((hashtag, index) => (
          <div
            key={hashtag.id}
            className="hashtag-item"
            onClick={() => handleHashtagClick(hashtag.slug)}
          >
            <div className="hashtag-rank">{index + 1}</div>
            <div className="hashtag-info">
              <div className="hashtag-name">#{hashtag.name}</div>
              <div className="hashtag-stats">
                {hashtag.recent_count > 0 && (
                  <span className="recent-posts">
                    {hashtag.recent_count} post
                    {hashtag.recent_count !== 1 ? "s" : ""} recientes
                  </span>
                )}
                {hashtag.usage_count > 0 && (
                  <span className="total-posts">
                    {hashtag.usage_count} total
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingHashtags;
