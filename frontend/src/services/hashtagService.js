import api from "./api";

/**
 * Servicio para gestionar hashtags
 */
const hashtagService = {
  /**
   * Obtener lista de hashtags
   * @param {string} search - Término de búsqueda opcional
   * @returns {Promise} Lista de hashtags
   */
  getHashtags: async (search = "") => {
    try {
      const params = search ? { search } : {};
      const response = await api.get("/posts/hashtags/", { params });
      return response.data;
    } catch (error) {
      console.error("Error al obtener hashtags:", error);
      throw error;
    }
  },

  /**
   * Obtener hashtags en tendencia (últimas 24 horas)
   * @returns {Promise} Lista de hashtags trending
   */
  getTrendingHashtags: async () => {
    try {
      const response = await api.get("/posts/hashtags/trending/");
      return response.data;
    } catch (error) {
      console.error("Error al obtener hashtags en tendencia:", error);
      throw error;
    }
  },

  /**
   * Obtener detalle de un hashtag
   * @param {string} slug - Slug del hashtag
   * @returns {Promise} Detalle del hashtag
   */
  getHashtagDetail: async (slug) => {
    try {
      const response = await api.get(`/posts/hashtags/${slug}/`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener detalle del hashtag:", error);
      throw error;
    }
  },

  /**
   * Obtener posts de un hashtag
   * @param {string} slug - Slug del hashtag
   * @returns {Promise} Lista de posts
   */
  getHashtagPosts: async (slug) => {
    try {
      const response = await api.get(`/posts/hashtags/${slug}/posts/`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener posts del hashtag:", error);
      throw error;
    }
  },

  /**
   * Extraer hashtags de un texto
   * @param {string} text - Texto a analizar
   * @returns {Array} Array de hashtags encontrados (sin #)
   */
  extractHashtags: (text) => {
    if (!text) return [];

    const pattern = /#([a-zA-Z0-9]\w*)/g;
    const matches = text.matchAll(pattern);
    const hashtags = new Set();

    for (const match of matches) {
      hashtags.add(match[1].toLowerCase());
    }

    return Array.from(hashtags);
  },

  /**
   * Convertir hashtags en un texto a enlaces
   * @param {string} text - Texto con hashtags
   * @returns {string} HTML con hashtags como enlaces
   */
  linkifyHashtags: (text) => {
    if (!text) return "";

    const pattern = /#([a-zA-Z0-9]\w*)/g;
    return text.replace(pattern, (match, hashtag) => {
      return `<a href="/hashtags/${hashtag.toLowerCase()}" class="hashtag-link">${match}</a>`;
    });
  },

  /**
   * Renderizar texto con hashtags destacados (para React)
   * @param {string} text - Texto con hashtags
   * @param {Function} onHashtagClick - Callback al hacer click en hashtag
   * @returns {Array} Array de elementos React
   */
  renderWithHashtags: (text, onHashtagClick = null) => {
    if (!text) return [];

    const pattern = /#([a-zA-Z0-9]\w*)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      // Agregar texto antes del hashtag
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        });
      }

      // Agregar hashtag
      parts.push({
        type: "hashtag",
        content: match[0],
        tag: match[1].toLowerCase(),
        onClick: onHashtagClick,
      });

      lastIndex = pattern.lastIndex;
    }

    // Agregar texto final
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex),
      });
    }

    return parts;
  },
};

export default hashtagService;
