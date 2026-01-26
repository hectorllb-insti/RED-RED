/**
 * Utilidades para formatear fechas
 */

/**
 * Formatea una fecha a formato local legible
 * @param {string|Date} date - Fecha en formato ISO o objeto Date
 * @param {Object} options - Opciones de formateo
 * @returns {string} Fecha formateada o "Fecha no disponible" si es inválida
 */
export const formatDate = (date, options = {}) => {
  if (!date) return "Fecha no disponible";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      console.error("Fecha inválida:", date);
      return "Fecha no disponible";
    }

    const defaultOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...options,
    };

    return dateObj.toLocaleDateString("es-ES", defaultOptions);
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return "Fecha no disponible";
  }
};

/**
 * Formatea una fecha con hora
 * @param {string|Date} date - Fecha en formato ISO o objeto Date
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date) => {
  if (!date) return "Fecha no disponible";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "Fecha no disponible";
    }

    return dateObj.toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error al formatear fecha y hora:", error);
    return "Fecha no disponible";
  }
};

/**
 * Formatea una fecha de forma corta (DD/MM/YYYY)
 * @param {string|Date} date - Fecha en formato ISO o objeto Date
 * @returns {string} Fecha formateada
 */
export const formatDateShort = (date) => {
  if (!date) return "Fecha no disponible";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "Fecha no disponible";
    }

    return dateObj.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (error) {
    return "Fecha no disponible";
  }
};

/**
 * Formatea tiempo relativo (hace X minutos/horas/días)
 * @param {string|Date} date - Fecha en formato ISO o objeto Date
 * @returns {string} Tiempo relativo formateado
 */
export const formatRelativeTime = (date) => {
  if (!date) return "Fecha no disponible";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "Fecha no disponible";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    if (diffInSeconds < 60) {
      return "Hace unos segundos";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} ${
        diffInMinutes === 1 ? "minuto" : "minutos"
      }`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `Hace ${diffInDays} ${diffInDays === 1 ? "día" : "días"}`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `Hace ${diffInMonths} ${diffInMonths === 1 ? "mes" : "meses"}`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `Hace ${diffInYears} ${diffInYears === 1 ? "año" : "años"}`;
  } catch (error) {
    console.error("Error al formatear tiempo relativo:", error);
    return "Fecha no disponible";
  }
};

/**
 * Formatea solo la hora
 * @param {string|Date} date - Fecha en formato ISO o objeto Date
 * @returns {string} Hora formateada
 */
export const formatTime = (date) => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
      return "";
    }

    return dateObj.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "";
  }
};

/**
 * Verifica si una fecha es válida
 * @param {string|Date} date - Fecha a verificar
 * @returns {boolean} True si la fecha es válida
 */
export const isValidDate = (date) => {
  if (!date) return false;

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
};
