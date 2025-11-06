import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import hashtagService from "../services/hashtagService";
import "./TrendingPage.css";

/**
 * Página de exploración de hashtags y tendencias
 */
const TrendingPage = () => {
  const navigate = useNavigate();
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [allHashtags, setAllHashtags] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("trending"); // 'trending' o 'all'

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [trending, all] = await Promise.all([
        hashtagService.getTrendingHashtags(),
        hashtagService.getHashtags(),
      ]);

      setTrendingHashtags(trending);
      setAllHashtags(all);
    } catch (error) {
      console.error("Error al cargar hashtags:", error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      setSearching(true);
      const results = await hashtagService.getHashtags(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error al buscar hashtags:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleHashtagClick = (slug) => {
    navigate(`/hashtags/${slug}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const displayedHashtags = searchQuery.trim()
    ? searchResults
    : activeTab === "trending"
    ? trendingHashtags
    : allHashtags;

  return (
    <div className="trending-page">
      <div className="trending-header">
        <h1>🔥 Explorar Tendencias</h1>
        <p>Descubre los hashtags más populares</p>
      </div>

      {/* Búsqueda */}
      <div className="search-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar hashtags..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searching && <div className="search-spinner"></div>}
        </div>
      </div>

      {/* Tabs */}
      {!searchQuery && (
        <div className="tabs">
          <button
            className={`tab ${activeTab === "trending" ? "active" : ""}`}
            onClick={() => setActiveTab("trending")}
          >
            🔥 Tendencias
          </button>
          <button
            className={`tab ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            📊 Todos
          </button>
        </div>
      )}

      {/* Resultados */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando hashtags...</p>
        </div>
      ) : (
        <div className="hashtags-grid">
          {displayedHashtags.length === 0 ? (
            <div className="no-results">
              <p>
                {searchQuery
                  ? "No se encontraron hashtags"
                  : "No hay hashtags disponibles"}
              </p>
            </div>
          ) : (
            displayedHashtags.map((hashtag, index) => (
              <div
                key={hashtag.id}
                className="hashtag-card"
                onClick={() => handleHashtagClick(hashtag.slug)}
              >
                {activeTab === "trending" && !searchQuery && (
                  <div className="hashtag-rank">#{index + 1}</div>
                )}
                <div className="hashtag-name">#{hashtag.name}</div>
                <div className="hashtag-stats">
                  {hashtag.recent_count > 0 && (
                    <span className="stat recent">
                      🔥 {hashtag.recent_count} recientes
                    </span>
                  )}
                  <span className="stat total">
                    📊 {hashtag.usage_count} total
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TrendingPage;
