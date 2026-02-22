/**
 * COSMETICS CONFIGURATION
 * Maps each shop item ID to its visual properties.
 * Used by UserAvatar (frame + effect) and Layout (badge).
 */

// --- FRAMES ---------------------------------------------------------------
// Each entry maps to a CSS class defined in animations.css (.cosmetic-frame-*)
export const FRAME_CONFIG = {
  frame_neon:    { className: "cosmetic-frame-neon",    label: "Marco Neón"      },
  frame_gold:    { className: "cosmetic-frame-gold",    label: "Marco Dorado"    },
  frame_fire:    { className: "cosmetic-frame-fire",    label: "Marco de Fuego"  },
  frame_diamond: { className: "cosmetic-frame-diamond", label: "Marco Diamante"  },
  frame_rainbow: { className: "cosmetic-frame-rainbow", label: "Marco Arcoíris"  },
};

// --- BADGES ---------------------------------------------------------------
// Displayed next to the username in the navbar header.
export const BADGE_CONFIG = {
  badge_supporter: { emoji: "💖", label: "Supporter", title: "Supporter de la Comunidad" },
  badge_gamer:     { emoji: "🎮", label: "Gamer",     title: "Gamer Oficial"             },
  badge_star:      { emoji: "⭐", label: "Estrella",  title: "Estrella de RedRed"        },
  badge_crown:     { emoji: "👑", label: "Rey/Reina", title: "Realeza de RedRed"          },
  badge_fire:      { emoji: "🔥", label: "Fuego",     title: "Usuario en Llamas"         },
};

// --- EFFECTS --------------------------------------------------------------
// Shown as an overlay when hovering the user's avatar in the navbar.
export const EFFECT_CONFIG = {
  effect_red: {
    label: "Efecto Rojo",
    hoverBg:     "rgba(239, 68, 68, 0.18)",
    hoverShadow: "0 0 18px rgba(239, 68, 68, 0.55)",
  },
  effect_gradient: {
    label: "Efecto Gradiente",
    hoverBg:     "rgba(139, 92, 246, 0.18)",
    hoverShadow: "0 0 18px rgba(139, 92, 246, 0.50)",
  },
  effect_glow: {
    label: "Efecto Dorado",
    hoverBg:     "rgba(251, 191, 36, 0.18)",
    hoverShadow: "0 0 18px rgba(251, 191, 36, 0.65), 0 0 6px rgba(253, 230, 138, 0.50)",
  },
  effect_neon: {
    label: "Efecto Neón",
    hoverBg:     "rgba(0, 255, 255, 0.13)",
    hoverShadow: "0 0 18px rgba(0, 255, 255, 0.60)",
  },
};
