/**
 * Gestor seguro de tokens con manejo de expiración automática
 */

class TokenManager {
  constructor() {
    this.tokenKey = "access_token";
    this.refreshKey = "refresh_token";
    this.expirationKey = "token_expiration";
  }

  /**
   * Guarda el token con timestamp de expiración
   */
  setToken(accessToken, refreshToken, expiresIn = 3600) {
    // 1 hora por defecto
    try {
      const expirationTime = Date.now() + expiresIn * 1000;

      localStorage.setItem(this.tokenKey, accessToken);
      localStorage.setItem(this.refreshKey, refreshToken);
      localStorage.setItem(this.expirationKey, expirationTime.toString());
    } catch (error) {
      console.error("Error guardando token");
    }
  }

  /**
   * Obtiene el token si no ha expirado
   */
  getToken() {
    try {
      const token = localStorage.getItem(this.tokenKey);
      const expiration = localStorage.getItem(this.expirationKey);

      if (!token || !expiration) {
        return null;
      }

      // Verificar si el token ha expirado
      if (Date.now() > parseInt(expiration)) {
        this.clearTokens();
        return null;
      }

      return token;
    } catch (error) {
      console.error("Error obteniendo token");
      return null;
    }
  }

  /**
   * Obtiene el refresh token
   */
  getRefreshToken() {
    try {
      return localStorage.getItem(this.refreshKey);
    } catch (error) {
      console.error("Error obteniendo refresh token");
      return null;
    }
  }

  /**
   * Verifica si hay un token válido
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Verifica si el token está próximo a expirar (menos de 5 minutos)
   */
  isTokenExpiringSoon() {
    try {
      const expiration = localStorage.getItem(this.expirationKey);
      if (!expiration) return true;

      const fiveMinutes = 5 * 60 * 1000;
      return Date.now() > parseInt(expiration) - fiveMinutes;
    } catch (error) {
      return true;
    }
  }

  /**
   * Elimina todos los tokens
   */
  clearTokens() {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.refreshKey);
      localStorage.removeItem(this.expirationKey);
    } catch (error) {
      console.error("Error limpiando tokens");
    }
  }
}

// Instancia única
export const tokenManager = new TokenManager();
export default tokenManager;
