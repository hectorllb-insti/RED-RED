"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationCenter from "./NotificationCenter";
import Avatar from "./ui/Avatar";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Buscar", href: "/search", icon: Search },
    { name: "Mensajes", href: "/messages", icon: MessageCircle },
    { name: "Historias", href: "/stories", icon: Camera },
    { name: "Perfil", href: `/profile/${user?.username}`, icon: User },
  ];

  const isActive = (path) => {
    return (
      location.pathname === path ||
      (path.includes("/profile") && location.pathname.includes("/profile"))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* 🎨 Header moderno con glassmorphism */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-18">
            {/* Logo con gradiente */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <Link
                to="/"
                className="text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-red-600 via-rose-500 to-red-600 bg-clip-text text-transparent hover:from-red-700 hover:via-rose-600 hover:to-red-700 transition-all"
              >
                RED-RED
              </Link>
            </motion.div>

            {/* Barra de búsqueda - Escritorio */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <Link to="/search" className="w-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative group"
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </div>
                  <div className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl leading-5 bg-gray-50/50 text-gray-500 hover:bg-white hover:border-red-200 cursor-pointer transition-all text-sm font-medium">
                    Buscar usuarios, publicaciones...
                  </div>
                </motion.div>
              </Link>
            </div>

            {/* Acciones - Escritorio */}
            <div className="hidden lg:flex items-center gap-2">
              <NotificationCenter />

              <Link to="/settings">
                <motion.button
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Configuración"
                >
                  <Settings className="h-5 w-5" />
                </motion.button>
              </Link>

              <Link to={`/profile/${user?.username}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-50 rounded-2xl transition-all"
                >
                  <Avatar
                    src={user?.profile_picture}
                    alt={user?.full_name}
                    size="sm"
                    online
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    {user?.full_name}
                  </span>
                </motion.div>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all ml-2"
                title="Cerrar sesión"
              >
                <LogOut className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Menú móvil toggle */}
            <div className="lg:hidden flex items-center gap-2">
              <NotificationCenter />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {/* Búsqueda móvil */}
                <Link to="/search" onClick={() => setMobileMenuOpen(false)}>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl bg-gray-50 text-gray-500 text-sm font-medium">
                      Buscar...
                    </div>
                  </div>
                </Link>

                {/* Navegación móvil */}
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-red-50 text-red-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${active ? "text-red-600" : ""}`}
                      />
                      {item.name}
                    </Link>
                  );
                })}

                <hr className="my-2 border-gray-200" />

                {/* Perfil y configuración móvil */}
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Settings className="h-5 w-5" />
                  Configuración
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <div className="flex">
        {/* 🎨 Sidebar - Solo escritorio */}
        <motion.nav
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="hidden lg:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 xl:w-72 bg-white/50 backdrop-blur-sm border-r border-gray-200/50"
        >
          <div className="p-4 space-y-1">
            {navigation.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <motion.div
                  key={item.name}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    className={`group flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 shadow-sm shadow-red-100"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-all ${
                        active
                          ? "text-red-600 scale-110"
                          : "group-hover:scale-110"
                      }`}
                    />
                    <span>{item.name}</span>
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-8 bg-red-600 rounded-full"
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.nav>

        {/* 🎨 Main Content con padding responsivo */}
        <main className="flex-1 lg:ml-64 xl:ml-72">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
