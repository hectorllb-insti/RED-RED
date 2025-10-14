import { createContext, useContext, useEffect, useReducer } from "react";
import { authService } from "../services/auth";
import socketService from "../services/socket";
import { tokenManager } from "../services/tokenManager";

const AuthContext = createContext();

const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getCurrentUser();
          dispatch({ type: "LOGIN_SUCCESS", payload: user });

          // Conectar WebSocket
          const token = localStorage.getItem("access_token");
          socketService.connect(token);
        } catch (error) {
          // Error loading user handled
          authService.logout();
          dispatch({ type: "LOGOUT" });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      await authService.login(email, password);
      const user = await authService.getCurrentUser();
      dispatch({ type: "LOGIN_SUCCESS", payload: user });

      // Conectar WebSocket con token seguro
      const token = tokenManager.getToken();
      socketService.connect(token);

      return { success: true };
    } catch (error) {
      let errorMessage = "Error al iniciar sesión";
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.detail) {
          errorMessage = "Credenciales inválidas";
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const register = async (userData) => {
    try {
      await authService.register(userData);
      return { success: true };
    } catch (error) {
      let errorMessage = "Error al registrarse";

      if (error.response?.data) {
        const data = error.response.data;
        // Manejar diferentes formatos de error del backend
        if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.username) {
          errorMessage = "Usuario ya existe";
        } else if (data.email) {
          errorMessage = "Email ya está registrado";
        } else if (data.password) {
          errorMessage = "Contraseña inválida";
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const logout = () => {
    authService.logout();
    socketService.disconnect();
    dispatch({ type: "LOGOUT" });
  };

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
