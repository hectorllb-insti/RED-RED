import axios from "axios";
import { tokenManager } from "./tokenManager";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Configuración de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Si es FormData, remover Content-Type para que axios lo configure automáticamente
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Manejar usuario baneado (403 con mensaje de baneo)
    if (error.response?.status === 403) {
      const errorData = error.response?.data;
      if (errorData?.detail && errorData.detail.includes("suspendida")) {
        tokenManager.clearTokens();
        window.location.href = "/login?banned=true";
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 401) {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );
          const newToken = response.data.access;
          // Actualizar token usando token manager seguro
          tokenManager.setToken(
            newToken,
            refreshToken,
            response.data.expires_in || 3600
          );
          error.config.headers.Authorization = `Bearer ${newToken}`;
          return api.request(error.config);
        } catch (refreshError) {
          tokenManager.clearTokens();
          window.location.href = "/login";
        }
      } else {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
