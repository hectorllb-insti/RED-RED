import { AnimatePresence, motion } from "framer-motion";
import { Check, Dices, Gift, Lock, Package, ShoppingBag, Sparkles, Tag, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

// --- CONSTANTS ---
const PRIZES = [
    { id: 1, label: "10 Puntos", value: 10, type: "common", color: "#f87171", probability: 0.4 },
    { id: 2, label: "50 Puntos", value: 50, type: "common", color: "#ef4444", probability: 0.3 },
    { id: 3, label: "100 Puntos", value: 100, type: "rare", color: "#dc2626", probability: 0.15 },
    { id: 4, label: "200 Puntos", value: 200, type: "rare", color: "#b91c1c", probability: 0.1 },
    { id: 5, label: "500 Puntos", value: 500, type: "epic", color: "#991b1b", probability: 0.04 },
    { id: 6, label: "1000 Puntos", value: 1000, type: "legendary", color: "#fbbf24", probability: 0.01 },
]

const SHOP_ITEMS = [
    // 🌟 PREMIUM EXCLUSIVO
    {
        id: "badge_verified",
        name: "Verificado",
        description: "Insignia exclusiva de usuario verificado. ¡Muy difícil de conseguir!",
        price: 50000,
        type: "badge",
        image: "✓",
        isPremium: true
    },

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

const Roulette = () => {
    const { user, addPoints, deductPoints, addToInventory, equipItem, updateUser } = useAuth();
    const { actualTheme } = useTheme();
    const isDark = actualTheme === "dark";
    const [activeTab, setActiveTab] = useState("play");

    // --- ROULETTE STATE ---
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [dailySpins, setDailySpins] = useState(0);
    const [lastPrize, setLastPrize] = useState(null);
    const [currentValue, setCurrentValue] = useState(PRIZES[0].value);

    // --- SHOP STATE ---
    const [shopFilter, setShopFilter] = useState("all");
    const [confirmPurchase, setConfirmPurchase] = useState(null);
    const [purchasing, setPurchasing] = useState(false);

    // Load daily spins
    useEffect(() => {
        if (user) {
            const today = new Date().toDateString();
            const storedData = JSON.parse(localStorage.getItem(`roulette_${user.id}`)) || {};

            if (storedData.date !== today) {
                setDailySpins(0);
                localStorage.setItem(`roulette_${user.id}`, JSON.stringify({ date: today, spins: 0 }));
            } else {
                setDailySpins(storedData.spins || 0);
            }
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
            localStorage.setItem(`roulette_${user.id}`, JSON.stringify({ date: today, spins: newSpins }));
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

        const random = Math.random();
        let accumulatedProbability = 0;
        let selectedPrize = PRIZES[0];

        for (const prize of PRIZES) {
            accumulatedProbability += prize.probability;
            if (random <= accumulatedProbability) {
                selectedPrize = prize;
                break;
            }
        }

        const segmentAngle = 360 / PRIZES.length;
        const prizeIndex = PRIZES.findIndex(p => p.id === selectedPrize.id);
        const targetRotation = 360 * 5 + (360 - (prizeIndex * segmentAngle));
        const randomOffset = Math.random() * (segmentAngle - 10) + 5;
        const finalRotation = rotation + targetRotation + randomOffset;

        setRotation(finalRotation);

        // Animate counter while spinning
        const interval = setInterval(() => {
            const randomPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
            setCurrentValue(randomPrize.value);
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            setSpinning(false);
            setLastPrize(selectedPrize);
            setCurrentValue(selectedPrize.value);

            const newSpins = dailySpins + 1;
            setDailySpins(newSpins);
            addPoints(selectedPrize.value);

            const today = new Date().toDateString();
            localStorage.setItem(`roulette_${user.id}`, JSON.stringify({ date: today, spins: newSpins }));

            if (selectedPrize.type === 'legendary') {
                toast.success(`¡INCREÍBLE! ¡Has ganado ${selectedPrize.label}! 🌟`, { duration: 5000 });
            } else if (selectedPrize.type === 'epic') {
                toast.success(`¡Genial! ¡Has ganado ${selectedPrize.label}! 🎉`, { duration: 4000 });
            } else {
                toast.success(`Has ganado ${selectedPrize.label}`);
            }
        }, 5000);
    };

    // --- SHOP LOGIC ---
    const handleBuyClick = (item) => {
        // Check if already owned
        const hasItem = user?.inventory?.some(i => i.id === item.id);
        if (hasItem) {
            toast("¡Ya tienes este artículo!", { icon: "🎒" });
            return;
        }

        // Check if can afford
        const currentPoints = user?.points || 0;
        if (currentPoints < item.price) {
            toast.error(`Te faltan ${item.price - currentPoints} puntos para comprar este artículo`);
            return;
        }

        // Show confirmation for expensive items
        if (item.price >= 10000) {
            setConfirmPurchase(item);
        } else {
            handleBuy(item);
        }
    };

    const handleBuy = (item) => {
        if (purchasing) return;

        setPurchasing(true);

        // Deduct points
        const success = deductPoints(item.price);

        if (success) {
            // Add to inventory
            addToInventory(item);

            // Show success message with special effect for premium items
            if (item.isPremium) {
                toast.success(`🌟 ¡INCREÍBLE! Has conseguido: ${item.name} 🌟`, {
                    duration: 5000,
                    style: {
                        background: '#10b981',
                        color: '#fff',
                        fontWeight: 'bold'
                    }
                });
            } else {
                toast.success(`✅ ¡Has comprado ${item.name}!`);
            }

            setConfirmPurchase(null);
        } else {
            toast.error("No tienes suficientes puntos");
        }

        setPurchasing(false);
    };

    // --- INVENTORY LOGIC ---
    const handleEquip = (item) => {
        const equipped = isEquipped(item);

        if (equipped) {
            // Unequip
            unequipItem(item.type);
            toast.success(`${item.name} desequipado`, { icon: "📦" });
        } else {
            // Equip
            equipItem(item);
            toast.success(`¡${item.name} equipado!`, { icon: "✨" });
        }
    };

    const unequipItem = (itemType) => {
        if (!user) return;

        let updates = {};
        if (itemType === 'frame') {
            updates = { equippedFrame: null };
        } else if (itemType === 'effect') {
            updates = { equippedEffect: null };
        } else if (itemType === 'badge') {
            updates = { equippedBadge: null };
        }

        const updatedUser = { ...user, ...updates };
        updateUser(updatedUser);

        localStorage.setItem(`equipped_${user.id}`, JSON.stringify({
            frame: updatedUser.equippedFrame,
            effect: updatedUser.equippedEffect,
            badge: updatedUser.equippedBadge
        }));
    };

    const isEquipped = (item) => {
        if (item.type === 'frame') return user?.equippedFrame?.id === item.id;
        if (item.type === 'effect') return user?.equippedEffect?.id === item.id;
        if (item.type === 'badge') return user?.equippedBadge?.id === item.id;
        return false;
    };

    return (
        <div className="space-y-6">
            {/* Header & Tabs */}
            <div className={`rounded-3xl border overflow-hidden ${isDark ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="p-6 pb-0">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className={`text-2xl font-black flex items-center gap-3 tracking-tight ${isDark ? "text-orange-500" : "text-slate-900"}`}>
                                <Trophy className="w-8 h-8 text-orange-500" />
                                Centro de Recompensas
                            </h1>
                            <p className={`mt-1 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                Juega, gana premios y personaliza tu perfil
                            </p>
                        </div>

                        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-black text-lg ${isDark
                            ? "bg-slate-800/50 border-yellow-500/20 text-yellow-500"
                            : "bg-yellow-50 border-yellow-200 text-yellow-600"
                            }`}>
                            <Trophy className="w-5 h-5 fill-current" />
                            <span>{user?.points || 0}</span>
                            <span className="text-xs opacity-60">PUNTOS</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs - Full Width Strip */}
                <div className={`px-6 py-3 border-t ${isDark ? "bg-[#1e293b] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex gap-8">
                        {[
                            { id: "play", label: "Jugar", icon: Dices },
                            { id: "shop", label: "Tienda", icon: ShoppingBag },
                            { id: "inventory", label: "Inventario", icon: Package },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 text-sm font-bold transition-colors relative py-2 ${activeTab === tab.id
                                    ? "text-red-500"
                                    : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "fill-current" : ""}`} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-red-500"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
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
                        className="grid lg:grid-cols-12 gap-8"
                    >
                        {/* Wheel Section (Left - 7 cols) */}
                        <div className="lg:col-span-7 flex flex-col items-center justify-start relative pt-8">

                            {/* Counter Tooltip */}
                            <motion.div
                                className={`relative z-20 mb-2 px-6 py-4 rounded-2xl text-center min-w-[140px] ${isDark
                                    ? "bg-[#1e293b] text-white shadow-xl"
                                    : "bg-white text-slate-900 shadow-xl border border-slate-100"}`}
                                animate={{ scale: spinning ? [1, 1.05, 1] : 1 }}
                                transition={{ duration: 0.3, repeat: spinning ? Infinity : 0 }}
                            >
                                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    {spinning ? "GIRANDO" : "LISTO"}
                                </div>
                                <div className="text-4xl font-black text-[#ff0033] leading-none mb-1">
                                    {currentValue}
                                </div>
                                <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    PUNTOS
                                </div>

                                {/* Triangle Pointer */}
                                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] ${isDark ? "border-t-[#1e293b]" : "border-t-white"} drop-shadow-sm`}></div>
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-[#ff0033]"></div>
                            </motion.div>

                            {/* Wheel */}
                            <div className="relative mb-10">
                                <div className={`relative p-4 rounded-full ${isDark ? "bg-[#0f172a]" : "bg-slate-50"}`}>
                                    <motion.div
                                        className={`relative w-[300px] h-[300px] md:w-[380px] md:h-[380px] rounded-full border-[12px] shadow-2xl overflow-hidden z-10 ${isDark ? "border-[#1e293b] bg-[#1e293b]" : "border-white bg-white"}`}
                                        animate={{ rotate: rotation }}
                                        transition={{ duration: 8, ease: [0.13, 0.99, 0.29, 1.0] }}
                                    >
                                        {PRIZES.map((prize, index) => {
                                            const segmentAngle = 360 / PRIZES.length;
                                            const rotation = segmentAngle * index;
                                            return (
                                                <div
                                                    key={prize.id}
                                                    className="absolute w-full h-full top-0 left-0 origin-center"
                                                    style={{ transform: `rotate(${rotation}deg)` }}
                                                >
                                                    <div
                                                        className="w-full h-full border-r border-black/20"
                                                        style={{
                                                            backgroundColor: prize.color,
                                                            clipPath: "polygon(50% 50%, 50% 0, 100% 0, 100% 35%)",
                                                            transform: `skewY(-30deg) rotate(30deg)`,
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </motion.div>

                                    {/* Center Cap */}
                                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full shadow-xl z-20 flex items-center justify-center border-[6px] ${isDark ? "bg-[#1e293b] border-[#0f172a]" : "bg-white border-slate-100"}`}>
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff0033] to-rose-700 flex items-center justify-center shadow-inner">
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="w-full max-w-md space-y-6">
                                <div className={`flex items-center justify-between px-6 py-3 rounded-2xl ${isDark ? "bg-[#1e293b]" : "bg-white border border-slate-200"}`}>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                        DISPONIBLES: {3 - dailySpins}/3
                                    </span>
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`w-3 h-3 rounded-full ${i <= (3 - dailySpins)
                                                ? "bg-[#ff0033]"
                                                : isDark ? "bg-slate-700" : "bg-slate-200"
                                                }`} />
                                        ))}
                                    </div>

                                    {dailySpins >= 3 && (user?.points || 0) >= 100 && (
                                        <button
                                            onClick={restoreSpin}
                                            className="ml-4 text-xs font-bold text-[#ff0033] hover:underline"
                                        >
                                            RESTAURAR (100pts)
                                        </button>
                                    )}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={spinWheel}
                                    disabled={spinning || dailySpins >= 3}
                                    className={`w-full py-5 rounded-2xl font-black text-xl tracking-wide shadow-xl transition-all flex items-center justify-center gap-3 ${spinning || dailySpins >= 3
                                        ? isDark ? "bg-slate-800 text-slate-400 cursor-not-allowed shadow-none" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                                        : "bg-[#ff0033] hover:bg-[#d9002b] text-white shadow-red-500/30"
                                        }`}
                                >
                                    {spinning ? (
                                        <>
                                            <Dices className="w-6 h-6 animate-spin" /> GIRANDO...
                                        </>
                                    ) : dailySpins >= 3 ? "SIN TIRADAS" : (
                                        <>
                                            <Dices className="w-6 h-6" /> ¡GIRAR RULETA!
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        {/* Prize List (Right - 5 cols) */}
                        <div className="lg:col-span-5">
                            <div className={`p-6 rounded-3xl h-full ${isDark ? "bg-[#1e293b]" : "bg-white border border-slate-200 shadow-sm"}`}>
                                <h3 className={`text-lg font-black mb-6 flex items-center gap-3 ${isDark ? "text-white" : "text-slate-900"}`}>
                                    <Gift className="w-5 h-5 text-[#ff0033]" />
                                    Tabla de Premios
                                </h3>
                                <div className="space-y-3">
                                    {PRIZES.map((prize) => (
                                        <div key={prize.id} className={`flex items-center justify-between p-4 rounded-xl transition-all ${isDark
                                            ? "bg-[#0f172a] hover:bg-slate-900"
                                            : "bg-white hover:bg-slate-50 border border-slate-200 shadow-sm"
                                            }`}>
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                                                    style={{ backgroundColor: prize.color }}
                                                >
                                                    <Trophy className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className={`font-bold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                                        {prize.value}
                                                    </div>
                                                    <div className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                                        Puntos
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider ${isDark ? "bg-[#1e293b] text-slate-400" : "bg-white border border-slate-200 text-slate-500"
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
                                        className={`relative p-6 rounded-2xl border backdrop-blur-xl flex flex-col ${item.isPremium
                                            ? isDark
                                                ? "bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/50 shadow-2xl shadow-yellow-500/20"
                                                : "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400/50 shadow-2xl shadow-yellow-500/10"
                                            : isDark
                                                ? "bg-slate-900/60 border-slate-800"
                                                : "bg-white/60 border-gray-200"
                                            }`}
                                    >
                                        {item.isPremium && (
                                            <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg animate-pulse">
                                                PREMIUM
                                            </div>
                                        )}
                                        <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl ${item.isPremium
                                            ? "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg"
                                            : isDark ? "bg-slate-800" : "bg-gray-100"
                                            }`}>
                                            <span className={item.isPremium ? "text-white font-black text-4xl" : ""}>{item.image}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                                {item.name}
                                                {item.isPremium && <span className="ml-2 text-yellow-500">★</span>}
                                            </h3>
                                            <p className={`text-sm mt-1 mb-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                                                {item.description}
                                            </p>
                                        </div>
                                        <div className={`flex items-center justify-between mt-4 pt-4 border-t ${isDark ? "border-slate-800" : "border-gray-200"}`}>
                                            <div className={`font-bold flex items-center gap-1 ${isOwned ? "text-green-500" :
                                                item.isPremium ? "text-yellow-500" :
                                                    canAfford ? "text-blue-500" : "text-slate-400"
                                                }`}>
                                                {isOwned ? (
                                                    <><Check className="w-4 h-4" /> Comprado</>
                                                ) : (
                                                    <><Tag className="w-4 h-4" /> {item.price.toLocaleString()}</>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleBuyClick(item)}
                                                disabled={isOwned || !canAfford || purchasing}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${isOwned
                                                    ? "bg-green-500/10 text-green-500 cursor-default"
                                                    : canAfford
                                                        ? item.isPremium
                                                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-yellow-500/25"
                                                            : "bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25"
                                                        : isDark ? "bg-slate-800 text-slate-400 cursor-not-allowed" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                    }`}
                                            >
                                                {purchasing ? "..." : isOwned ? "✓" : canAfford ? "Comprar" : <Lock className="w-4 h-4" />}
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
                                    return (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`relative p-6 rounded-2xl border backdrop-blur-xl flex flex-col ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white/60 border-gray-200"
                                                } ${equipped ? "ring-2 ring-green-500" : ""}`}
                                        >
                                            <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl ${isDark ? "bg-slate-800" : "bg-gray-100"
                                                }`}>
                                                {item.image}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                                    {item.name}
                                                </h3>
                                                <p className={`text-sm mt-1 mb-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                                                    {item.description}
                                                </p>
                                            </div>
                                            <div className={`mt-4 pt-4 border-t ${isDark ? "border-slate-800" : "border-gray-200"}`}>
                                                <button
                                                    onClick={() => handleEquip(item)}
                                                    className={`w-full px-4 py-2 rounded-xl text-sm font-bold transition-all ${equipped
                                                        ? "bg-green-500 text-white shadow-lg shadow-green-500/25 hover:bg-green-600"
                                                        : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25"
                                                        }`}
                                                >
                                                    {equipped ? "✓ Equipado (Click para desequipar)" : "Equipar"}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Purchase Confirmation Modal */}
            <AnimatePresence>
                {confirmPurchase && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setConfirmPurchase(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className={`max-w-md w-full p-8 rounded-3xl border shadow-2xl ${isDark
                                ? "bg-slate-900 border-slate-700"
                                : "bg-white border-gray-200"
                                }`}
                        >
                            <div className="text-center">
                                <div className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-4xl ${confirmPurchase.isPremium
                                    ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                                    : isDark ? "bg-slate-800" : "bg-gray-100"
                                    }`}>
                                    <span className={confirmPurchase.isPremium ? "text-white font-black" : ""}>{confirmPurchase.image}</span>
                                </div>

                                <h3 className={`text-2xl font-black mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                                    ¿Confirmar compra?
                                </h3>

                                <p className={`text-lg font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                                    {confirmPurchase.name}
                                    {confirmPurchase.isPremium && <span className="ml-2 text-yellow-500">★</span>}
                                </p>

                                <p className={`text-sm mb-6 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                                    {confirmPurchase.description}
                                </p>

                                <div className={`p-4 rounded-2xl mb-6 ${isDark ? "bg-slate-800/50" : "bg-gray-50"
                                    }`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={isDark ? "text-slate-400" : "text-gray-600"}>Precio:</span>
                                        <span className={`font-black text-lg ${confirmPurchase.isPremium ? "text-yellow-500" : "text-red-500"
                                            }`}>
                                            {confirmPurchase.price.toLocaleString()} pts
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={isDark ? "text-slate-400" : "text-gray-600"}>Tus puntos:</span>
                                        <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                                            {(user?.points || 0).toLocaleString()} pts
                                        </span>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent my-2"></div>
                                    <div className="flex justify-between items-center">
                                        <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Después de comprar:</span>
                                        <span className={`font-black text-lg ${(user?.points || 0) - confirmPurchase.price >= 0
                                            ? "text-green-500"
                                            : "text-red-500"
                                            }`}>
                                            {((user?.points || 0) - confirmPurchase.price).toLocaleString()} pts
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setConfirmPurchase(null)}
                                        className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${isDark
                                            ? "bg-slate-800 text-white hover:bg-slate-700"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleBuy(confirmPurchase)}
                                        disabled={purchasing}
                                        className={`flex-1 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${confirmPurchase.isPremium
                                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-yellow-500/25"
                                            : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/25"
                                            } disabled:opacity-50`}
                                    >
                                        {purchasing ? "Comprando..." : "Confirmar"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Roulette;
