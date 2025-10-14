/**
 * Sistema centralizado de manejo de errores
 */

import toast from "react-hot-toast";

// Tipos de errores comunes
export const ERROR_TYPES = {
  VALIDATION: "validation",
  NETWORK: "network",
  AUTH: "authentication",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "not_found",
  SERVER: "server",
  UNKNOWN: "unknown",
};

// Mensajes de error user-friendly
const ERROR_MESSAGES = {
  [ERROR_TYPES.VALIDATION]: "Los datos ingresados no son válidos",
  [ERROR_TYPES.NETWORK]: "Error de conexión. Verifica tu internet",
  [ERROR_TYPES.AUTH]: "Sesión expirada. Inicia sesión nuevamente",
  [ERROR_TYPES.FORBIDDEN]: "No tienes permisos para realizar esta acción",
  [ERROR_TYPES.NOT_FOUND]: "El recurso solicitado no fue encontrado",
  [ERROR_TYPES.SERVER]: "Error interno del servidor. Intenta más tarde",
  [ERROR_TYPES.UNKNOWN]: "Ha ocurrido un error inesperado",
};

/**
 * Determina el tipo de error basado en el código de estado HTTP
 */
const getErrorType = (status, message = "") => {
  if (!status) return ERROR_TYPES.NETWORK;

  switch (status) {
    case 400:
      return ERROR_TYPES.VALIDATION;
    case 401:
      return ERROR_TYPES.AUTH;
    case 403:
      return ERROR_TYPES.FORBIDDEN;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 422:
      return ERROR_TYPES.VALIDATION;
    case 500:
    case 502:
    case 503:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};

/**
 * Extrae mensaje de error detallado del response
 */
const extractErrorMessage = (error) => {
  if (error?.response?.data) {
    const data = error.response.data;

    // Buscar mensaje específico en diferentes formatos
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (data.detail) return data.detail;

    // Manejar errores de validación de Django
    if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
      return data.non_field_errors[0];
    }

    // Manejar errores de campo específicos
    const fieldErrors = Object.keys(data).filter(
      (key) => Array.isArray(data[key]) && data[key].length > 0
    );

    if (fieldErrors.length > 0) {
      const field = fieldErrors[0];
      return `${field}: ${data[field][0]}`;
    }
  }

  return error?.message || "Error desconocido";
};

/**
 * Maneja errores de forma centralizada
 */
export const handleError = (error, customMessage = null) => {
  const status = error?.response?.status;
  const errorType = getErrorType(status);

  let displayMessage;

  if (customMessage) {
    displayMessage = customMessage;
  } else {
    // Usar mensaje específico del servidor si está disponible
    const serverMessage = extractErrorMessage(error);

    // Si el mensaje del servidor es útil, usarlo. Si no, usar mensaje genérico
    if (serverMessage && serverMessage !== "Error desconocido") {
      displayMessage = serverMessage;
    } else {
      displayMessage = ERROR_MESSAGES[errorType];
    }
  }

  // Mostrar toast según el tipo de error
  switch (errorType) {
    case ERROR_TYPES.AUTH:
      toast.error(displayMessage);
      // Redirigir a login si es necesario
      break;
    case ERROR_TYPES.VALIDATION:
      toast.error(displayMessage);
      break;
    case ERROR_TYPES.SERVER:
      toast.error(displayMessage);
      break;
    default:
      toast.error(displayMessage);
  }

  // Log detallado para desarrollo
  if (process.env.NODE_ENV === "development") {
    console.group("🚨 Error Details");
    console.error("Original Error:", error);
    console.log("Status:", status);
    console.log("Type:", errorType);
    console.log("Display Message:", displayMessage);
    console.groupEnd();
  }

  return {
    type: errorType,
    message: displayMessage,
    originalError: error,
  };
};

/**
 * Hook personalizado para manejo de errores en mutations
 */
export const useErrorHandler = () => {
  return {
    onError: (error, variables, context) => {
      handleError(error);
    },
  };
};

/**
 * Wrapper para operaciones async con manejo de errores
 */
export const withErrorHandling = async (operation, customMessage = null) => {
  try {
    return await operation();
  } catch (error) {
    handleError(error, customMessage);
    throw error; // Re-throw para que el componente pueda manejar el estado loading
  }
};

const errorHandler = {
  handleError,
  useErrorHandler,
  withErrorHandling,
  ERROR_TYPES,
};

export default errorHandler;
