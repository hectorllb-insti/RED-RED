/**
 * Utilidades para logging seguro
 * En producción, los logs sensibles se deshabilitan automáticamente
 */

const isDevelopment = process.env.NODE_ENV === "development";

export const secureLogger = {
  // Log seguro para información general
  info: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  // Log seguro para advertencias
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  // Errores siempre se logean pero sin información sensible
  error: (message, error = null) => {
    if (isDevelopment) {
      console.error(message, error);
    } else {
      // En producción solo logeamos errores genéricos
      console.error("Application error occurred");
    }
  },

  // Log para desarrollo únicamente
  debug: (...args) => {
    if (isDevelopment) {
      console.log("[DEBUG]", ...args);
    }
  },
};

// Función para sanitizar datos antes de logear
export const sanitizeForLog = (data) => {
  if (!isDevelopment) {
    return "[SANITIZED]";
  }

  if (typeof data === "object" && data !== null) {
    const sanitized = { ...data };

    // Remover campos sensibles
    const sensitiveFields = [
      "password",
      "token",
      "access_token",
      "refresh_token",
      "authorization",
    ];
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  return data;
};
