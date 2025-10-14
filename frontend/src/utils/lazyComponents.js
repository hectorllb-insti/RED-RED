/**
 * Configuración de lazy loading para optimización de rendimiento
 */

import React, { lazy } from "react";

// Lazy loading de páginas principales
export const LazyHome = lazy(() => import("../pages/Home"));
export const LazyMessages = lazy(() => import("../pages/Messages"));
export const LazySettings = lazy(() => import("../pages/Settings"));
export const LazyProfile = lazy(() => import("../pages/Profile"));
export const LazyNotifications = lazy(() => import("../pages/Notifications"));
export const LazyStories = lazy(() => import("../pages/Stories"));
export const LazySearch = lazy(() => import("../pages/Search"));

// Lazy loading de componentes grandes
export const LazyNotificationCenter = lazy(() =>
  import("../components/NotificationCenter")
);

// Componente de loading personalizado
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando...</p>
    </div>
  </div>
);

// Componente de error boundary para lazy components
export class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error loading component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error al cargar el componente</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
