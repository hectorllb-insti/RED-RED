/**
 * Utilidades para manejo de imágenes
 */

/**
 * Cache para almacenar URLs con cache busting para evitar regenerar timestamps constantemente
 */
const urlCache = new Map();

/**
 * Agrega un timestamp a la URL de una imagen para evitar caché del navegador
 * @param {string} imageUrl - URL de la imagen
 * @param {boolean} forceNew - Forzar nuevo timestamp
 * @returns {string} URL con timestamp
 */
export const addCacheBuster = (imageUrl, forceNew = false) => {
  if (!imageUrl) return imageUrl;

  // No agregar cache buster a imágenes por defecto
  if (imageUrl.includes("default-avatar")) {
    return imageUrl;
  }

  // Verificar cache primero si no forzamos nuevo
  if (!forceNew && urlCache.has(imageUrl)) {
    return urlCache.get(imageUrl);
  }

  // Siempre agregar cache buster a URLs que parecen ser del backend
  if (
    imageUrl.includes("/media/") || 
    imageUrl.includes("profile_pics/") ||
    imageUrl.includes("localhost") || 
    imageUrl.includes("127.0.0.1") ||
    imageUrl.startsWith("/") // URLs relativas del backend
  ) {
    const separator = imageUrl.includes("?") ? "&" : "?";
    const cachedUrl = `${imageUrl}${separator}t=${Date.now()}`;
    
    // Guardar en cache
    urlCache.set(imageUrl, cachedUrl);
    return cachedUrl;
  }

  return imageUrl;
};

/**
 * Obtiene la URL de imagen con cache busting
 * @param {string} imageUrl - URL de la imagen
 * @param {boolean} forceBust - Forzar cache busting
 * @returns {string} URL procesada
 */
export const getImageUrl = (imageUrl, forceBust = false) => {
  if (!imageUrl) return "/default-avatar.png";

  // Si es una imagen de perfil del backend, aplicar cache busting
  if (
    forceBust || 
    imageUrl.includes("/media/") || 
    imageUrl.includes("profile_pics/") ||
    imageUrl.includes("cover_pics/")
  ) {
    return addCacheBuster(imageUrl, false); // No forzar nuevo timestamp siempre
  }

  return imageUrl;
};

/**
 * Limpiar cache de URLs cuando el usuario actualiza su perfil
 * @param {string} userId - ID del usuario que actualizó su perfil
 */
export const clearUserImageCache = (userId) => {
  const keysToDelete = [];
  
  for (const [key] of urlCache) {
    if (key.includes("profile_pics/") || key.includes("cover_pics/")) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => urlCache.delete(key));
};

/**
 * Generar nueva URL con cache busting para una imagen específica
 * @param {string} imageUrl - URL base de la imagen
 * @returns {string} Nueva URL con timestamp actualizado
 */
export const refreshImageUrl = (imageUrl) => {
  if (!imageUrl) return "/default-avatar.png";
  
  // Limpiar URL de parámetros anteriores
  const cleanUrl = imageUrl.split('?')[0];
  
  // Eliminar de cache si existe
  urlCache.delete(imageUrl);
  urlCache.delete(cleanUrl);
  
  // Generar nueva URL con cache busting forzado
  const separator = cleanUrl.includes("?") ? "&" : "?";
  const newUrl = `${cleanUrl}${separator}t=${Date.now()}&r=${Math.random()}`;
  
  // Guardar nueva URL en cache
  urlCache.set(cleanUrl, newUrl);
  
  return newUrl;
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
