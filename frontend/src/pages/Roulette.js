import { AnimatePresence, motion } from "framer-motion";
import { Check, Dices, Gift, Lock, Package, ShoppingBag, Sparkles, Tag, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// --- CONSTANTS ---
const PRIZES = [
    { id: 1, label: "10 Puntos",   value: 10,   type: "common",    color: "#94a3b8", probability: 0.40 },
    { id: 2, label: "50 Puntos",   value: 50,   type: "common",    color: "#64748b", probability: 0.30 },
    { id: 3, label: "100 Puntos",  value: 100,  type: "rare",      color: "#3b82f6", probability: 0.15 },
    { id: 4, label: "200 Puntos",  value: 200,  type: "rare",      color: "#2563eb", probability: 0.10 },
    { id: 5, label: "500 Puntos",  value: 500,  type: "epic",      color: "#8b5cf6", probability: 0.04 },
    { id: 6, label: "1000 Puntos", value: 1000, type: "legendary", color: "#eab308", probability: 0.01 },
];

// --- PITY SYSTEM THRESHOLDS ---
// After PITY_RARE_THRESHOLD consecutive "common" results → guaranteed rare+
const PITY_RARE_THRESHOLD = 6;
// After PITY_EPIC_THRESHOLD consecutive "common" or "rare" results → guaranteed epic+
const PITY_EPIC_THRESHOLD = 10;

const SHOP_ITEMS = [
    // Marcos de Perfil
    { id: "frame_neon", name: "Marco Neón", description: "Un borde brillante para tu perfil", price: 500, type: "frame", image: "🌈" },
    { id: "frame_gold", name: "Marco Dorado", description: "Lujo puro para usuarios VIP", price: 1000, type: "frame", image: "👑" },
    { id: "frame_fire", name: "Marco de Fuego", description: "¡Tu perfil está que arde!", price: 750, type: "frame", image: "🔥" },
    { id: "frame_diamond", name: "Marco Diamante", description: "Brilla con elegancia suprema", price: 1500, type: "frame", image: "💎" },
    { id: "frame_rainbow", name: "Marco Arcoíris", description: "Colores vibrantes en tu perfil", price: 800, type: "frame", image: "🎨" },

    // Efectos de Chat
    { id: "effect_red", name: "Efecto Rojo", description: "Mensajes con estilo RedRed", price: 300, type: "effect", image: "❤️" },
    { id: "effect_gradient", name: "Efecto Gradiente", description: "Texto con degradado único", price: 400, type: "effect", image: "🌈" },
    { id: "effect_glow", name: "Efecto Brillo", description: "Tus mensajes brillan", price: 500, type: "effect", image: "✨" },
    { id: "effect_neon", name: "Efecto Neón", description: "Estilo cyberpunk en tus chats", price: 600, type: "effect", image: "🔆" },

    // Insignias
    { id: "badge_supporter", name: "Insignia Supporter", description: "Muestra tu apoyo a la comunidad", price: 2000, type: "badge", image: "💖" },
    { id: "badge_gamer", name: "Insignia Gamer", description: "Para los verdaderos jugones", price: 1500, type: "badge", image: "🎮" },
    { id: "badge_star", name: "Insignia Estrella", description: "Destaca entre todos", price: 1800, type: "badge", image: "⭐" },
    { id: "badge_crown", name: "Insignia Corona", description: "Realeza en RedRed", price: 2500, type: "badge", image: "👑" },
    { id: "badge_fire", name: "Insignia Fuego", description: "Usuario en llamas", price: 1600, type: "badge", image: "🔥" },
];

// ─────────────────────────────────────────────────────────────────
// SOUND ENGINE — Web Audio API (sin archivos externos)
// ─────────────────────────────────────────────────────────────────
const playSound = (type) => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const master = ctx.createGain();
        master.gain.value = 0.45;
        master.connect(ctx.destination);

        const tone = (freq, start, dur, vol = 0.6, wave = 'sine') => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = wave;
            o.frequency.value = freq;
            g.gain.setValueAtTime(vol, ctx.currentTime + start);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
            o.connect(g); g.connect(master);
            o.start(ctx.currentTime + start);
            o.stop(ctx.currentTime + start + dur + 0.05);
        };

        if (type === 'common') {
            // Tonos descendentes suaves \u2014 "oh no\u2026" amigable
            tone(440, 0.0,  0.18, 0.35, 'sine');
            tone(370, 0.16, 0.18, 0.35, 'sine');
            tone(294, 0.32, 0.28, 0.40, 'sine');
            tone(220, 0.54, 0.40, 0.30, 'sine');
        } else if (type === 'rare') {
            // Victoria sencilla — fanfarria ascendente
            tone(523, 0.0,  0.14, 0.5);
            tone(659, 0.13, 0.14, 0.5);
            tone(784, 0.26, 0.22, 0.6);
            tone(1047,0.44, 0.35, 0.55);
        } else if (type === 'epic') {
            // Gran victoria — acorde + arpeggio
            tone(523, 0.0,  0.15, 0.45);
            tone(659, 0.0,  0.15, 0.45);
            tone(784, 0.0,  0.15, 0.45);
            tone(523, 0.18, 0.12, 0.5);
            tone(659, 0.30, 0.12, 0.5);
            tone(784, 0.42, 0.12, 0.5);
            tone(1047,0.54, 0.3,  0.6);
            tone(1319,0.80, 0.4,  0.55);
        } else if (type === 'legendary') {
            // Fanfarria épica
            [523,659,784,1047,1319,1568].forEach((f, i) => tone(f, i*0.12, 0.2, 0.55));
            tone(2093, 0.75, 0.6, 0.6);
            // bombo
            const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1) * Math.pow(1-i/data.length, 3);
            const src = ctx.createBufferSource();
            const bg = ctx.createGain(); bg.gain.value = 0.5;
            src.buffer = buf; src.connect(bg); bg.connect(master);
            src.start(ctx.currentTime);
        }
        setTimeout(() => ctx.close(), 3000);
    } catch (e) { /* navegadores sin AudioContext */ }
};

const LEGENDARY_EMOJIS = ['🌟','✨','🏆','💛','🎉','🎊','👑','⭐','🥇','🎆','💥','🌠'];

const LegendaryOverlay = ({ onClose }) => {
    const emojis = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        emoji: LEGENDARY_EMOJIS[i % LEGENDARY_EMOJIS.length],
        left: Math.random() * 100,
        delay: Math.random() * 1.2,
        dur: 1.5 + Math.random() * 1.5,
    }));
    useEffect(() => {
        const t = setTimeout(onClose, 4500);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(234,179,8,0.25) 0%, transparent 70%)' }}
        >
            {emojis.map(({ id, emoji, left, delay, dur }) => (
                <motion.span key={id} className="absolute text-3xl select-none"
                    style={{ left: `${left}%`, top: '-40px' }}
                    animate={{ y: ['0vh','110vh'], rotate: [0, 360*2], opacity: [0,1,1,0] }}
                    transition={{ duration: dur, delay, ease: 'linear' }}
                >{emoji}</motion.span>
            ))}
            <motion.div
                initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: [0.4,1.15,1], opacity: 1 }}
                transition={{ duration: 0.6, ease: 'backOut' }}
                className="text-center px-12 py-10 rounded-3xl"
                style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(12px)', border: '2px solid #eab308', boxShadow: '0 0 60px rgba(234,179,8,0.5)' }}
            >
                <div className="text-7xl mb-3">🏆</div>
                <div className="text-4xl font-black text-yellow-400 tracking-tight">¡LEGENDARIO!</div>
                <div className="text-xl font-bold text-yellow-200 mt-1">1 000 Puntos</div>
            </motion.div>
        </motion.div>
    );
};

const Roulette = () => {
    const { user, addPoints, deductPoints, addToInventory, buyItem, equipItem, unequipItem } = useAuth();
    const { actualTheme } = useTheme();
    const isDark = actualTheme === "dark";
    const [activeTab, setActiveTab] = useState("play");
    const [showLegendary, setShowLegendary] = useState(false);

    // --- ROULETTE STATE ---
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [dailySpins, setDailySpins] = useState(0);
    const [lastPrize, setLastPrize] = useState(null);
    const [currentValue, setCurrentValue] = useState(PRIZES[0].value);
    // Pity counters — persisted in localStorage across sessions
    const [pityCount, setPityCount] = useState(0);     // consecutive common results
    const [rarePityCount, setRarePityCount] = useState(0); // consecutive common+rare results

    // --- SHOP STATE ---
    const [shopFilter, setShopFilter] = useState("all");

    // Load daily spins + pity counters
    useEffect(() => {
        if (user) {
            const today = new Date().toDateString();
            const storedData = JSON.parse(localStorage.getItem(`roulette_${user.id}`)) || {};

            if (storedData.date !== today) {
                // New day: reset spins but KEEP pity counters (they persist across days)
                setDailySpins(0);
                localStorage.setItem(`roulette_${user.id}`, JSON.stringify({
                    date: today,
                    spins: 0,
                    pityCount: storedData.pityCount || 0,
                    rarePityCount: storedData.rarePityCount || 0,
                }));
            } else {
                setDailySpins(storedData.spins || 0);
            }
            // Always load pity counters regardless of day change
            setPityCount(storedData.pityCount || 0);
            setRarePityCount(storedData.rarePityCount || 0);
        }
    }, [user]);

    // --- ROULETTE LOGIC ---
    const restoreSpin = () => {
        if (dailySpins === 0) {
            toast.error("Ya tienes todas tus tiradas disponibles");
            return;
        }
        if ((user?.points || 0) < 100) {
            toast.error("Necesitas 100 puntos para restaurar una tirada");
            return;
        }
        const success = deductPoints(100);
        if (success) {
            const newSpins = dailySpins - 1;
            setDailySpins(newSpins);
            const today = new Date().toDateString();
            const storedData = JSON.parse(localStorage.getItem(`roulette_${user.id}`)) || {};
            localStorage.setItem(`roulette_${user.id}`, JSON.stringify({
                date: today,
                spins: newSpins,
                pityCount: storedData.pityCount || 0,
                rarePityCount: storedData.rarePityCount || 0,
            }));
            toast.success("¡Tirada restaurada! 🎉");
        }
    };

    const spinWheel = () => {
        if (dailySpins >= 3) {
            toast.error("¡No tienes tiradas disponibles! Restaura con puntos.");
            return;
        }
        if (spinning) return;

        setSpinning(true);
        setLastPrize(null);

        // =====================================================================
        // PRIZE SELECTION — deterministic by color + weighted probability + pity
        // =====================================================================
        const storedData = JSON.parse(localStorage.getItem(`roulette_${user.id}`)) || {};
        const currentPity = storedData.pityCount || 0;
        const currentRarePity = storedData.rarePityCount || 0;

        let selectedPrize;

        if (currentRarePity >= PITY_EPIC_THRESHOLD) {
            // Pity EPIC: after 10 consecutive common/rare results → guaranteed epic or legendary
            const eligible = PRIZES.filter(p => p.type === 'epic' || p.type === 'legendary');
            selectedPrize = eligible[Math.floor(Math.random() * eligible.length)];
        } else if (currentPity >= PITY_RARE_THRESHOLD) {
            // Pity RARE: after 6 consecutive common results → guaranteed rare or better
            const eligible = PRIZES.filter(p => p.type === 'rare' || p.type === 'epic' || p.type === 'legendary');
            selectedPrize = eligible[Math.floor(Math.random() * eligible.length)];
        } else {
            // Normal weighted selection (low values more probable by design)
            const random = Math.random();
            let accumulated = 0;
            selectedPrize = PRIZES[PRIZES.length - 1]; // safe fallback
            for (const prize of PRIZES) {
                accumulated += prize.probability;
                if (random <= accumulated) {
                    selectedPrize = prize;
                    break;
                }
            }
        }

        // =====================================================================
        // UPDATE PITY COUNTERS based on the result
        // =====================================================================
        let newPityCount;
        let newRarePityCount;

        if (selectedPrize.type === 'legendary' || selectedPrize.type === 'epic') {
            // Big win → reset ALL pity
            newPityCount = 0;
            newRarePityCount = 0;
        } else if (selectedPrize.type === 'rare') {
            // Rare → resets common-pity, but rare-pity keeps accumulating
            newPityCount = 0;
            newRarePityCount = currentRarePity + 1;
        } else {
            // Common → both counters increment
            newPityCount = currentPity + 1;
            newRarePityCount = currentRarePity + 1;
        }

        // =====================================================================
        // WHEEL ROTATION — conic-gradient segments are mathematically exact:
        //   PRIZES[i] occupies  [i*60°, (i+1)*60°], center at  i*60+30°
        //   (all angles clockwise from the top, matching CSS conic-gradient)
        //
        // The pointer is fixed at the top (0°). After a clockwise rotation of R
        // degrees, a wheel point originally at angle θ appears at absolute angle
        // (θ + R) mod 360. We want that to equal 0° (pointer position), so:
        //   R ≡ -θ  ≡  (360 - θ)  (mod 360)
        //
        // We then pick the smallest positive delta from the current accumulated
        // rotation and add 5 full spins for visual effect.
        // =====================================================================
        const SEG = 360 / PRIZES.length;           // 60°
        const prizeIndex = PRIZES.findIndex(p => p.id === selectedPrize.id);
        const segCenter = prizeIndex * SEG + SEG / 2;          // 30, 90, 150, 210, 270, 330
        const needed = (360 - segCenter + 360) % 360;          // wheel angle that puts segCenter at 0°
        const current = ((rotation % 360) + 360) % 360;        // normalise accumulated rotation
        let delta = (needed - current + 360) % 360;
        if (delta < 5) delta += 360;                           // avoid a near-zero spin
        const finalRotation = rotation + 360 * 5 + delta;
        setRotation(finalRotation);

        // Animate the counter display while the wheel is spinning
        const interval = setInterval(() => {
            const randomPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
            setCurrentValue(randomPrize.value);
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            setSpinning(false);
            setLastPrize(selectedPrize);
            setCurrentValue(selectedPrize.value);
            setPityCount(newPityCount);
            setRarePityCount(newRarePityCount);

            const newSpins = dailySpins + 1;
            setDailySpins(newSpins);
            addPoints(selectedPrize.value);

            const today = new Date().toDateString();
            localStorage.setItem(`roulette_${user.id}`, JSON.stringify({
                date: today,
                spins: newSpins,
                pityCount: newPityCount,
                rarePityCount: newRarePityCount,
            }));

            // Sonido según rareza
            playSound(selectedPrize.type);

            if (selectedPrize.type === 'legendary') {
                setShowLegendary(true);
                toast.success(`¡INCREÍBLE! ¡Has ganado ${selectedPrize.label}! 🌟`, { duration: 5000 });
            } else if (selectedPrize.type === 'epic') {
                toast.success(`¡Genial! ¡Has ganado ${selectedPrize.label}! 🎉`, { duration: 4000 });
            } else if (selectedPrize.type === 'rare') {
                toast.success(`¡Bien! Has ganado ${selectedPrize.label} 🎵`, { duration: 3000 });
            } else {
                toast(`Has ganado ${selectedPrize.label}`, { icon: '🎲' });
            }
        }, 5000);
    };

    // --- DEV UTIL: reset daily spins (remove before production) ---
    const resetSpins = () => {
        if (!user) return;
        const today = new Date().toDateString();
        const storedData = JSON.parse(localStorage.getItem(`roulette_${user.id}`)) || {};
        localStorage.setItem(`roulette_${user.id}`, JSON.stringify({
            date: today,
            spins: 0,
            pityCount: storedData.pityCount || 0,
            rarePityCount: storedData.rarePityCount || 0,
        }));
        setDailySpins(0);
        toast.success('Tiradas reseteadas — tienes 3/3 disponibles');
    };

    // --- SHOP LOGIC ---
    const handleBuy = (item) => {
        const hasItem = user?.inventory?.some(i => i.id === item.id);
        if (hasItem) {
            toast("¡Ya tienes este artículo!", { icon: "🎒" });
            return;
        }
        if ((user?.points || 0) < item.price) {
            toast.error("No tienes suficientes puntos");
            return;
        }
        // Un único dispatch atómico: evita el bug de closure estále
        const success = buyItem(item);
        if (success) {
            toast.success(`¡Has comprado ${item.name}! -${item.price} pts`);
        } else {
            toast.error("No se pudo completar la compra");
        }
    };

    // --- INVENTORY LOGIC ---
    const handleEquip = (item) => {
        const alreadyEquipped = isEquipped(item);
        equipItem(item); // toggles in AuthContext
        if (alreadyEquipped) {
            toast(`${item.name} desequipado`, { icon: "📦" });
        } else {
            const typeLabel = item.type === 'frame' ? 'Marco equipado 🔼'
                : item.type === 'badge' ? 'Insignia equipada 🏆'
                : 'Efecto equipado ✨';
            toast.success(`${item.name} — ${typeLabel}`);
        }
    };

    const isEquipped = (item) => {
        if (item.type === 'frame')  return user?.equippedFrame?.id  === item.id;
        if (item.type === 'effect') return user?.equippedEffect?.id === item.id;
        if (item.type === 'badge')  return user?.equippedBadge?.id  === item.id;
        return false;
    };

    const COSMETIC_TYPE_META = {
        frame:  { label: 'Marco',    hint: 'Aparece alrededor de tu foto de perfil',          icon: '🔼' },
        badge:  { label: 'Insignia', hint: 'Aparece junto a tu nombre en el encabezado',      icon: '🏆' },
        effect: { label: 'Efecto',   hint: 'Visible al pasar el ratón sobre tu foto de perfil', icon: '✨' },
    };

    return (
        <div className="space-y-6 min-h-screen pb-20">
            {/* Overlay victoria legendaria */}
            <AnimatePresence>
                {showLegendary && <LegendaryOverlay onClose={() => setShowLegendary(false)} />}
            </AnimatePresence>

            {/* Header & Tabs */}
            <div className={`sticky top-[4.5rem] z-30 p-6 rounded-3xl border backdrop-blur-xl transition-all shadow-xl ${isDark ? "bg-slate-900/90 border-slate-700/50" : "bg-white/90 border-white/50"
                }`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className={`text-2xl md:text-3xl font-black flex items-center gap-3 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 inline mr-2" />
                                Centro de Recompensas
                            </span>
                        </h1>
                        <p className={`mt-1 text-sm md:text-base font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Juega, gana premios y personaliza tu perfil
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`px-4 md:px-6 py-2 md:py-3 rounded-2xl border-2 shadow-xl ${isDark
                            ? "bg-slate-800 border-yellow-500/20 text-yellow-400 shadow-yellow-500/10"
                            : "bg-white border-yellow-100 text-yellow-600 shadow-yellow-500/5"
                            } font-black flex items-center gap-2 text-lg md:text-xl transform hover:scale-105 transition-transform`}>
                            <Trophy className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                            <span>{user?.points || 0}</span>
                            <span className="text-xs font-bold opacity-60 uppercase tracking-wider">Puntos</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50">
                    {[
                        { id: "play", label: "Jugar", icon: Dices },
                        { id: "shop", label: "Tienda", icon: ShoppingBag },
                        { id: "inventory", label: "Inventario", icon: Package },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                ? "bg-white dark:bg-slate-700 text-red-500 shadow-lg shadow-slate-200/50 dark:shadow-none"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 md:w-5 md:h-5 ${activeTab === tab.id ? "fill-current" : ""}`} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- TAB CONTENT: PLAY --- */}
            <AnimatePresence mode="wait">
                {activeTab === "play" && (
                    <motion.div
                        key="play"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid lg:grid-cols-2 gap-12"
                    >
                        {/* Wheel Section */}
                        <div className="flex flex-col items-center justify-start p-4 md:p-6 relative">
                            {/* Dynamic Counter Above Wheel */}
                            <motion.div
                                className={`mb-4 px-8 py-4 rounded-2xl border-2 shadow-2xl backdrop-blur-xl ${isDark
                                    ? "bg-slate-800/90 border-slate-600 text-white"
                                    : "bg-white/90 border-slate-200 text-slate-900"
                                    }`}
                                animate={{ scale: spinning ? [1, 1.1, 1] : 1 }}
                                transition={{ duration: 0.3, repeat: spinning ? Infinity : 0 }}
                            >
                                <div className="text-center">
                                    <div className={`text-xs md:text-sm font-bold uppercase tracking-wider mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                        {spinning ? "Girando..." : lastPrize ? "¡Ganaste!" : "Listo"}
                                    </div>
                                    <motion.div
                                        key={currentValue}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-4xl md:text-5xl font-black bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent"
                                    >
                                        {currentValue}
                                    </motion.div>
                                    <div className={`text-xs md:text-sm font-bold uppercase tracking-wider mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                        Puntos
                                    </div>
                                </div>
                            </motion.div>

                            {/* Wheel Container with Pointer Outside */}
                            <div className="relative">
                                {/* Pointer - Outside the wheel */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-xl">
                                    <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[28px] border-t-slate-700" />
                                </div>

                                <div className="relative p-2 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 shadow-2xl">
                                    <motion.div
                                        className="relative w-[280px] h-[280px] md:w-[380px] md:h-[380px] rounded-full border-[8px] border-slate-900 dark:border-slate-950 z-10 overflow-hidden"
                                        animate={{ rotate: rotation }}
                                        transition={{ duration: 8, ease: [0.13, 0.99, 0.29, 1.0] }}
                                        style={{
                                            // conic-gradient: each segment occupies exactly 60° starting at 0° (top, clockwise)
                                            // PRIZES[i] center = i*60 + 30 degrees — perfectly predictable
                                            background: `conic-gradient(${PRIZES.map((p, i) => `${p.color} ${i * 60}deg ${(i + 1) * 60}deg`).join(', ')})`,
                                            boxShadow: "0 10px 30px -5px rgba(0,0,0,0.3), inset 0 2px 20px rgba(0,0,0,0.4)"
                                        }}
                                    >
                                        {/* Divider lines between segments */}
                                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                                            {PRIZES.map((_, i) => {
                                                const rad = (i * 60 * Math.PI) / 180;
                                                return (
                                                    <line
                                                        key={i}
                                                        x1="50" y1="50"
                                                        x2={50 + 50 * Math.sin(rad)}
                                                        y2={50 - 50 * Math.cos(rad)}
                                                        stroke="rgba(0,0,0,0.55)"
                                                        strokeWidth="1.2"
                                                    />
                                                );
                                            })}
                                        </svg>
                                        {/* Glossy overlay */}
                                        <div className="absolute inset-0 rounded-full" style={{ background: "conic-gradient(rgba(255,255,255,0.12) 0deg, rgba(0,0,0,0.12) 180deg, rgba(255,255,255,0.12) 360deg)" }} />
                                    </motion.div>

                                    {/* Center Cap */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_4px_12px_rgba(0,0,0,0.3)] z-20 flex items-center justify-center border-4 border-slate-300">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-white to-slate-100 flex items-center justify-center shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)]">
                                            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-slate-600 fill-slate-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="mt-8 md:mt-12 text-center z-10 space-y-4 md:space-y-6">
                                <div className="flex flex-col md:flex-row items-center gap-3">
                                    <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-full border backdrop-blur-md ${isDark ? "bg-slate-800/80 border-slate-700" : "bg-white/80 border-slate-200"
                                        }`}>
                                        <span className={`text-xs md:text-sm font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                            Disponibles: {3 - dailySpins}/3
                                        </span>
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className={`w-3 h-3 rounded-full transition-all duration-500 ${i <= (3 - dailySpins)
                                                    ? "bg-gradient-to-tr from-green-500 to-emerald-400 shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                                                    : "bg-slate-300 dark:bg-slate-700"
                                                    }`} />
                                            ))}
                                        </div>
                                    </div>

                                    {process.env.NODE_ENV === 'development' && (
                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={resetSpins}
                                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all"
                                                title="Solo visible en development"
                                            >
                                                DEV: Reset 3/3
                                            </button>
                                            <button
                                                onClick={() => { addPoints(15000); toast.success('DEV: +15 000 pts añadidos'); }}
                                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-500 hover:bg-blue-600 text-white transition-all"
                                                title="Solo visible en development"
                                            >
                                                DEV: +15k pts
                                            </button>
                                        </div>
                                    )}

                                    <button
                                        onClick={restoreSpin}
                                        disabled={dailySpins === 0 || (user?.points || 0) < 100}
                                        className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${dailySpins > 0 && (user?.points || 0) >= 100
                                            ? "bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg shadow-yellow-500/25"
                                            : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                            }`}
                                    >
                                        Restaurar (100pts)
                                    </button>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={spinWheel}
                                    disabled={spinning || dailySpins >= 3}
                                    className={`w-full md:w-auto px-12 md:px-16 py-4 md:py-5 rounded-3xl font-black text-lg md:text-xl tracking-wide shadow-[0_15px_40px_-10px_rgba(239,68,68,0.5)] transition-all ${spinning || dailySpins >= 3
                                        ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
                                        : "bg-gradient-to-r from-red-500 via-red-600 to-rose-600 text-white border-b-6 border-red-800 active:border-b-0 active:translate-y-1"
                                        }`}
                                >
                                    {spinning ? (
                                        <span className="flex items-center gap-3">
                                            <Dices className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> GIRANDO...
                                        </span>
                                    ) : dailySpins >= 3 ? "SIN TIRADAS" : "¡GIRAR AHORA!"}
                                </motion.button>
                            </div>
                        </div>

                        {/* Info Panel */}
                        <div className="space-y-4 md:space-y-6 flex flex-col justify-start">
                            <AnimatePresence>
                                {lastPrize && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`p-6 md:p-8 rounded-3xl border text-center relative overflow-hidden shadow-2xl ${isDark
                                            ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700"
                                            : "bg-gradient-to-br from-white to-slate-50 border-white"
                                            }`}
                                    >
                                        <h3 className={`text-lg md:text-xl font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                                            ¡Felicidades!
                                        </h3>
                                        <div className="text-4xl md:text-5xl font-black mb-3 drop-shadow-lg" style={{ color: lastPrize.color }}>
                                            +{lastPrize.value}
                                        </div>
                                        <div className={`inline-block px-3 py-1 rounded-full text-xs md:text-sm font-bold border ${isDark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600"
                                            }`}>
                                            Puntos añadidos
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className={`p-6 md:p-8 rounded-3xl border backdrop-blur-xl shadow-lg ${isDark ? "bg-slate-900/60 border-slate-700/50" : "bg-white/60 border-white/60"
                                }`}>
                                <h3 className={`text-lg md:text-xl font-black mb-4 md:mb-6 flex items-center gap-2 md:gap-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                                    <Gift className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                                    Tabla de Premios
                                </h3>
                                <div className="space-y-2 md:space-y-3">
                                    {PRIZES.map((prize) => (
                                        <div key={prize.id} className={`flex items-center justify-between p-3 md:p-4 rounded-2xl transition-all ${isDark ? "bg-slate-800/50 hover:bg-slate-800" : "bg-white/50 hover:bg-white"
                                            }`}>
                                            <div className="flex items-center gap-3 md:gap-4">
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: prize.color }}>
                                                    <Trophy className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                                </div>
                                                <span className={`font-bold text-sm md:text-base ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                                    {prize.label}
                                                </span>
                                            </div>
                                            <span className={`text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-lg border uppercase tracking-wider ${prize.type === 'legendary' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' :
                                                prize.type === 'epic' ? 'border-purple-500/30 text-purple-500 bg-purple-500/10' :
                                                    prize.type === 'rare' ? 'border-blue-500/30 text-blue-500 bg-blue-500/10' :
                                                        'border-slate-400/30 text-slate-400 bg-slate-400/5'
                                                }`}>
                                                {prize.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- TAB CONTENT: SHOP --- */}
                {activeTab === "shop" && (
                    <motion.div
                        key="shop"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                            {[
                                { id: "all", label: "Todo" },
                                { id: "frame", label: "Marcos" },
                                { id: "effect", label: "Efectos" },
                                { id: "badge", label: "Insignias" },
                            ].map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setShopFilter(filter.id)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${shopFilter === filter.id
                                        ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                                        : isDark
                                            ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {SHOP_ITEMS.filter(i => shopFilter === 'all' || i.type === shopFilter).map((item) => {
                                const isOwned = user?.inventory?.some(i => i.id === item.id);
                                const canAfford = (user?.points || 0) >= item.price;

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -5 }}
                                        className={`relative p-4 sm:p-6 rounded-2xl border backdrop-blur-xl flex flex-col overflow-hidden min-w-0 ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/60 border-gray-200"
                                            }`}
                                    >
                                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl flex-shrink-0 ${isDark ? "bg-slate-800" : "bg-gray-100"
                                            }`}>
                                            {item.image}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className={`text-base sm:text-lg font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                                                {item.name}
                                            </h3>
                                            <p className={`text-sm mt-1 mb-4 line-clamp-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                                                {item.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                                            <div className={`font-bold flex items-center gap-1 flex-shrink min-w-0 ${isOwned ? "text-green-500" : canAfford ? "text-yellow-500" : "text-slate-400"
                                                }`}>
                                                {isOwned
                                                    ? <><Check className="w-4 h-4 flex-shrink-0" /><span className="truncate">En propiedad</span></>
                                                    : <><Tag className="w-4 h-4 flex-shrink-0" /><span>{item.price}</span></>
                                                }
                                            </div>
                                            <button
                                                onClick={() => handleBuy(item)}
                                                disabled={isOwned || !canAfford}
                                                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${isOwned
                                                    ? "bg-green-500/10 text-green-500 cursor-default"
                                                    : canAfford
                                                        ? "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25"
                                                        : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                                    }`}
                                            >
                                                {isOwned ? "Comprado" : canAfford ? "Comprar" : <Lock className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* --- TAB CONTENT: INVENTORY --- */}
                {activeTab === "inventory" && (
                    <motion.div
                        key="inventory"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {/* Currently equipped summary */}
                        {(user?.equippedFrame || user?.equippedBadge || user?.equippedEffect) && (
                            <div className={`mb-6 p-4 rounded-2xl border flex flex-wrap gap-3 items-center ${
                                isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-green-50/60 border-green-200'
                            }`}>
                                <span className={`text-xs font-bold uppercase tracking-wider ${
                                    isDark ? 'text-slate-400' : 'text-slate-500'
                                }`}>Equipado ahora:</span>
                                {user.equippedFrame && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-600 border border-green-500/30">
                                        🔼 {user.equippedFrame.name}
                                    </span>
                                )}
                                {user.equippedBadge && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600 border border-blue-500/30">
                                        🏆 {user.equippedBadge.name}
                                    </span>
                                )}
                                {user.equippedEffect && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-600 border border-purple-500/30">
                                        ✨ {user.equippedEffect.name}
                                    </span>
                                )}
                            </div>
                        )}

                        {(!user?.inventory || user.inventory.length === 0) ? (
                            <div className="text-center py-20">
                                <Package className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-slate-700" : "text-gray-300"}`} />
                                <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Tu inventario está vacío</h3>
                                <p className={`mt-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                                    Juega a la ruleta o visita la tienda para conseguir objetos.
                                </p>
                                <button
                                    onClick={() => setActiveTab('shop')}
                                    className="mt-6 px-6 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
                                >
                                    Ir a la Tienda
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {user.inventory.map((item) => {
                                    const equipped = isEquipped(item);
                                    const meta = COSMETIC_TYPE_META[item.type] || {};
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`relative p-6 rounded-2xl border backdrop-blur-xl flex flex-col transition-all ${
                                                isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/60 border-gray-200"
                                            } ${equipped ? "ring-2 ring-green-500 shadow-green-500/20 shadow-lg" : ""}`}
                                        >
                                            {/* Equipped badge */}
                                            {equipped && (
                                                <span className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500 text-white">
                                                    Equipado
                                                </span>
                                            )}

                                            <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl ${
                                                isDark ? "bg-slate-800" : "bg-gray-100"
                                            }`}>
                                                {item.image}
                                            </div>

                                            <div className="flex-1">
                                                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                                    {item.name}
                                                </h3>
                                                <p className={`text-sm mt-1 mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                                                    {item.description}
                                                </p>
                                                {/* Cosmetic type hint */}
                                                {meta.hint && (
                                                    <p className={`text-[11px] font-medium flex items-center gap-1 ${
                                                        isDark ? 'text-slate-500' : 'text-slate-400'
                                                    }`}>
                                                        <span>{meta.icon}</span>
                                                        <span>{meta.hint}</span>
                                                    </p>
                                                )}
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800 flex gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => handleEquip(item)}
                                                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                        equipped
                                                            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30"
                                                            : isDark
                                                                ? "bg-slate-700 text-white hover:bg-slate-600"
                                                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                                    }`}
                                                >
                                                    {equipped ? "Desequipar" : "Equipar"}
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Roulette;
