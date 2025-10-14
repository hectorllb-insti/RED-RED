/**
 * Utilidades de seguridad para validación y sanitización
 */

// Patrones peligrosos que deben ser bloqueados
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^>]*>/gi,
  /<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi,
];

export const securityUtils = {
  /**
   * Sanitiza texto para prevenir XSS
   */
  sanitizeText: (text) => {
    if (!text || typeof text !== "string") {
      return "";
    }

    // Escapar caracteres HTML peligrosos
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  },

  /**
   * Valida contenido HTML básico (solo etiquetas permitidas)
   */
  sanitizeHtml: (html) => {
    if (!html || typeof html !== "string") {
      return "";
    }

    // Verificar patrones peligrosos
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(html)) {
        return ""; // Rechazar contenido peligroso
      }
    }

    // Remover etiquetas no permitidas
    return html.replace(/<(?!\/?(?:p|br|strong|em|u|i|b)\b)[^>]+>/gi, "");
  },

  /**
   * Valida URLs para evitar javascript: y otros esquemas peligrosos
   */
  validateUrl: (url) => {
    if (!url || typeof url !== "string") {
      return false;
    }

    try {
      const parsedUrl = new URL(url);
      return ["http:", "https:", "mailto:"].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  },

  /**
   * Valida longitud de contenido
   */
  validateLength: (content, maxLength = 1000) => {
    return content && content.length <= maxLength;
  },

  /**
   * Valida formato de email
   */
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Valida nombre de usuario (solo caracteres seguros)
   */
  validateUsername: (username) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  },

  /**
   * Sanitiza completamente un post o comentario
   */
  sanitizePost: (content) => {
    if (!content) return "";

    // Aplicar validaciones
    if (!securityUtils.validateLength(content, 2000)) {
      throw new Error("Contenido demasiado largo");
    }

    // Sanitizar el contenido
    return securityUtils.sanitizeText(content).trim();
  },
};

export default securityUtils;
