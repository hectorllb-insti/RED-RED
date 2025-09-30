import api from "./api";

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
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
    }
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem("access_token");
  },

  // Obtener perfil actual
  getCurrentUser: async () => {
    const response = await api.get("/users/profile/");
    return response.data;
  },
};
