/**
 * UserAvatar — Avatar con soporte para cosméticos (marco de foto).
 *
 * Props:
 *  - src         URL de la foto de perfil
 *  - alt         Texto alternativo
 *  - size        "xs" | "sm" | "md" | "lg" | "xl"  (default: "sm")
 *  - showOnline  Mostrar indicador verde de conexión
 *  - frame       Objeto equipado (de equippedFrame en AuthContext) — opcional override
 *  - className   Clases extra para el contenedor externo
 *
 * El efecto cosmético se aplica en el contenedor padre (Layout), no aquí.
 */
import React from "react";
import { useAuth } from "../context/AuthContext";
import { FRAME_CONFIG } from "../cosmetics/config";
import { getImageUrl } from "../utils/imageUtils";
import "../styles/animations.css";

const SIZE_PX = { xs: 32, sm: 40, md: 48, lg: 64, xl: 96, "2xl": 128 };
const ONLINE_PX = { xs: 8, sm: 10, md: 12, lg: 14, xl: 18, "2xl": 22 };

const UserAvatar = ({
  src,
  alt = "User",
  size = "sm",
  showOnline = false,
  frame: frameProp,
  className = "",
}) => {
  const { user } = useAuth();
  const [imgError, setImgError] = React.useState(false);

  // Resolve frame: prop override → auth user
  const equippedFrame = frameProp !== undefined ? frameProp : user?.equippedFrame;
  const frameConfig   = equippedFrame ? FRAME_CONFIG[equippedFrame.id] : null;

  const px       = SIZE_PX[size]   || 40;
  const onlinePx = ONLINE_PX[size] || 10;
  // El exterior siempre ocupa el tamaño máximo (con marco) para no desplazar el layout
  const maxPx    = px + 6;

  const imageUrl = imgError || !src ? "/default-avatar.png" : getImageUrl(src, false);

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: maxPx, height: maxPx }}
    >
      {/* ── Frame wrapper (only when a frame is equipped) ── */}
      {frameConfig ? (
        <div
          className={`cosmetic-frame-wrapper ${frameConfig.className}`}
          style={{ width: maxPx, height: maxPx }}
        >
          <img
            src={imageUrl}
            alt={alt}
            onError={() => setImgError(true)}
            style={{
              width: px,
              height: px,
              borderRadius: "9999px",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      ) : (
        /* No frame — plain avatar, centrado dentro del slot fijo */
        <img
          src={imageUrl}
          alt={alt}
          onError={() => setImgError(true)}
          style={{
            width: px,
            height: px,
            borderRadius: "9999px",
            objectFit: "cover",
            boxShadow: "0 0 0 2px white, 0 2px 8px rgba(0,0,0,0.18)",
            display: "block",
          }}
        />
      )}

      {/* ── Online indicator — posición siempre relativa al slot fijo ── */}
      {showOnline && (
        <span
          style={{
            position: "absolute",
            bottom: 3,
            right:  3,
            width:  onlinePx,
            height: onlinePx,
            borderRadius: "9999px",
            background: "#22c55e",
            border: "2px solid white",
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

export default UserAvatar;
