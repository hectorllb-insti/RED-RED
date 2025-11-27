import { createContext, useContext, useEffect, useReducer } from "react";
import { useTheme } from "../context/ThemeContext";
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
  const { changeTheme } = useTheme();

  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getCurrentUser();

          // Verificar si el usuario está baneado
          if (user.is_banned) {
            authService.logout();
            dispatch({ type: "LOGOUT" });
            window.location.href = "/login?banned=true";
            return;
          }

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

        // Manejar error de usuario baneado
        if (
          data.detail &&
          typeof data.detail === "string" &&
          data.detail.includes("suspendida")
        ) {
          errorMessage = data.detail;
        } else if (data.is_banned) {
          errorMessage = `Tu cuenta ha sido suspendida. Razón: ${data.ban_reason}`;
        } else if (data.detail) {
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
    // Reset theme to light mode on logout
    changeTheme("light");
    // Also clear any persisted theme preference
    localStorage.setItem("theme", "light");
    // Ensure root class is updated
    const root = window.document.documentElement;
    root.classList.remove("dark");
  };

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });

    // Persist inventory and equipped items if they changed
    if (state.user?.id) {
      if (userData.inventory !== undefined) {
        localStorage.setItem(`inventory_${state.user.id}`, JSON.stringify(userData.inventory));
      }
      if (userData.equippedFrame !== undefined || userData.equippedEffect !== undefined || userData.equippedBadge !== undefined) {
        const equipped = {
          frame: userData.equippedFrame !== undefined ? userData.equippedFrame : state.user.equippedFrame,
          effect: userData.equippedEffect !== undefined ? userData.equippedEffect : state.user.equippedEffect,
          badge: userData.equippedBadge !== undefined ? userData.equippedBadge : state.user.equippedBadge
        };
        localStorage.setItem(`equipped_${state.user.id}`, JSON.stringify(equipped));
      }
    }

    // Notificar al WebSocket sobre la actualización del perfil
    if (socketService.isConnected()) {
      socketService.send({
        type: "profile_updated",
        user_data: userData,
      });
    }
  };

  // 🌟 Sistema de Puntos y Gamificación
  const addPoints = (amount) => {
    if (!state.user) return;
    const newPoints = (state.user.points || 0) + amount;
    const updatedUser = { ...state.user, points: newPoints };

    dispatch({ type: "UPDATE_USER", payload: updatedUser });
    localStorage.setItem(`points_${state.user.id}`, newPoints);
  };

  const deductPoints = (amount) => {
    if (!state.user) return false;
    const currentPoints = state.user.points || 0;

    if (currentPoints < amount) return false;

    const newPoints = currentPoints - amount;
    const updatedUser = { ...state.user, points: newPoints };

    dispatch({ type: "UPDATE_USER", payload: updatedUser });
    localStorage.setItem(`points_${state.user.id}`, newPoints);
    return true;
  };

  const addToInventory = (item) => {
    if (!state.user) return;
    const currentInventory = state.user.inventory || [];

    // Evitar duplicados
    if (currentInventory.find(i => i.id === item.id)) return;

    const newInventory = [...currentInventory, item];
    const updatedUser = { ...state.user, inventory: newInventory };

    dispatch({ type: "UPDATE_USER", payload: updatedUser });
    localStorage.setItem(`inventory_${state.user.id}`, JSON.stringify(newInventory));
  };

  const equipItem = (item) => {
    if (!state.user) return;

    let updates = {};
    if (item.type === 'frame') {
      updates = { equippedFrame: item };
    } else if (item.type === 'effect') {
      updates = { equippedEffect: item };
    } else if (item.type === 'badge') {
      updates = { equippedBadge: item };
    }

    const updatedUser = { ...state.user, ...updates };
    dispatch({ type: "UPDATE_USER", payload: updatedUser });

    localStorage.setItem(`equipped_${state.user.id}`, JSON.stringify({
      frame: updatedUser.equippedFrame,
      effect: updatedUser.equippedEffect,
      badge: updatedUser.equippedBadge
    }));
  };

  // Cargar datos de gamificación al iniciar sesión
  useEffect(() => {
    if (state.user && state.isAuthenticated) {
      const savedPoints = parseInt(localStorage.getItem(`points_${state.user.id}`)) || 0;
      const savedInventory = JSON.parse(localStorage.getItem(`inventory_${state.user.id}`)) || [];
      const savedEquipped = JSON.parse(localStorage.getItem(`equipped_${state.user.id}`)) || {};

      if (state.user.points !== savedPoints || !state.user.inventory) {
        dispatch({
          type: "UPDATE_USER",
          payload: {
            points: savedPoints,
            inventory: savedInventory,
            equippedFrame: savedEquipped.frame,
            equippedEffect: savedEquipped.effect,
            equippedBadge: savedEquipped.badge
          }
        });
      }
    }
  }, [state.isAuthenticated, state.user?.id]);

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    addPoints,
    deductPoints,
    addToInventory,
    equipItem,
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
