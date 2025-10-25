/**
 * Utilidades para manejo de imágenes
 */

/**
 * Agrega un timestamp a la URL de una imagen para evitar caché del navegador
 * @param {string} imageUrl - URL de la imagen
 * @returns {string} URL con timestamp
 */
export const addCacheBuster = (imageUrl) => {
  if (!imageUrl) return imageUrl;

  // No agregar cache buster a imágenes por defecto o externas
  if (
    imageUrl.includes("default-avatar") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    // Solo agregar a URLs del backend local
    if (!imageUrl.includes("localhost") && !imageUrl.includes("127.0.0.1")) {
      return imageUrl;
    }
  }

  const separator = imageUrl.includes("?") ? "&" : "?";
  return `${imageUrl}${separator}t=${Date.now()}`;
};

/**
 * Obtiene la URL de imagen con cache busting
 * @param {string} imageUrl - URL de la imagen
 * @param {boolean} forceBust - Forzar cache busting
 * @returns {string} URL procesada
 */
export const getImageUrl = (imageUrl, forceBust = false) => {
  if (!imageUrl) return "/default-avatar.png";

  if (forceBust) {
    return addCacheBuster(imageUrl);
  }

  return imageUrl;
};

/**
 * Precargar imagen para evitar flickering
 * @param {string} imageUrl - URL de la imagen
 * @returns {Promise} Promise que se resuelve cuando la imagen se carga
 */
export const preloadImage = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageUrl;
  });
};

const imageUtils = {
  addCacheBuster,
  getImageUrl,
  preloadImage,
};

export default imageUtils;
