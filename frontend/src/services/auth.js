import api from "./api";
import { tokenManager } from "./tokenManager";

export const authService = {
  // Registro de usuario
  register: async (userData) => {
    const response = await api.post("/auth/register/", userData);
    return response.data;
  },

  // Login de usuario
  login: async (email, password) => {
    const response = await api.post("/auth/login/", { email, password });
    if (response.data.access) {
      // Usar token manager seguro
      tokenManager.setToken(
        response.data.access,
        response.data.refresh,
        response.data.expires_in || 3600 // 1 hora por defecto
      );
    }
    return response.data;
  },

  // Logout
  logout: () => {
    tokenManager.clearTokens();
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return tokenManager.isAuthenticated();
  },

  // Obtener perfil actual
  getCurrentUser: async () => {
    const response = await api.get("/users/profile/");
    return response.data;
  },
};
