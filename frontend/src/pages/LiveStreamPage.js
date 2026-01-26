import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Video, VideoOff, Monitor, MonitorOff, Users, Send, X, LogOut,
    Maximize2, Minimize2, Eye, Shield, Star, DollarSign, Heart,
    MessageCircle, Smile, Gem, Sword, Crown
} from 'lucide-react';
import toast from 'react-hot-toast';
import Peer from 'peerjs';
import EmojiPicker from 'emoji-picker-react';
import { useQueryClient } from 'react-query';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const LiveStreamPage = () => {
    const queryClient = useQueryClient();
    const { streamId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { actualTheme } = useTheme();
    const isDark = actualTheme === 'dark';

    const [stream, setStream] = useState(null);
    const [isStreamer, setIsStreamer] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [viewersCount, setViewersCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showViewersPanel, setShowViewersPanel] = useState(false);
    const [connectedViewers, setConnectedViewers] = useState([]);
    const [showControls, setShowControls] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Media states
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // Refs
    const videoRef = useRef(null);
    const wsRef = useRef(null);
    const localStreamRef = useRef(null);
    const commentsEndRef = useRef(null);
    const peerRef = useRef(null);
    const callsRef = useRef([]);
    const videoContainerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    const loadStreamData = async () => {
        try {
            const response = await api.get(`/live/streams/${streamId}/`);
            setStream(response.data);
            const userIsStreamer = response.data.streamer === user.id;
            setIsStreamer(userIsStreamer);
            setViewersCount(response.data.viewers_count || 0);

            if (response.data.status === 'live') {
                setIsStreaming(true);
            }

            const commentsResponse = await api.get(`/live/streams/${streamId}/comments/`);
            setComments(commentsResponse.data);
        } catch (error) {
            console.error('Error loading stream:', error);
            toast.error('Error al cargar el directo');
            navigate('/');
        }
    };

    useEffect(() => {
        if (!stream) return;

        const initPeer = async () => {
            const peerId = isStreamer ? `red-red-streamer-${streamId}` : undefined;

            const peer = new Peer(peerId, {
                debug: 0,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                }
            });

            peer.on('open', (id) => {
                console.log('Peer conectado:', id);
                if (isStreamer) {
                    toast.success('Listo para transmitir');
                } else if (isStreaming) {
                    connectToStreamer(peer);
                }
            });

            peer.on('call', (call) => {
                if (isStreamer && localStreamRef.current) {
                    console.log('Viewer conectado:', call.peer);
                    call.answer(localStreamRef.current);
                    callsRef.current.push(call);
                }
            });

            peer.on('error', (err) => {
                console.error('Error de conexión:', err);
            });

            peerRef.current = peer;
        };

        initPeer();

        return () => {
            if (peerRef.current) {
                peerRef.current.destroy();
            }
        };
    }, [streamId, isStreamer, isStreaming]);

    const createDummyStream = () => {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const dest = ctx.createMediaStreamDestination();
        const os = ctx.createOscillator();
        os.connect(dest);
        os.start();
        const audioTrack = dest.stream.getAudioTracks()[0];
        audioTrack.enabled = false;

        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx2d = canvas.getContext('2d');
        ctx2d.fillStyle = 'black';
        ctx2d.fillRect(0, 0, 640, 480);
        const videoStream = canvas.captureStream(30);
        const videoTrack = videoStream.getVideoTracks()[0];

        return new MediaStream([audioTrack, videoTrack]);
    };

    const connectToStreamer = (peer) => {
        const streamerPeerId = `red-red-streamer-${streamId}`;
        const dummyStream = createDummyStream();
        const call = peer.call(streamerPeerId, dummyStream);

        if (!call) return;

        call.on('stream', (remoteStream) => {
            console.log('Conectado al stream');
            if (videoRef.current) {
                videoRef.current.srcObject = remoteStream;
                videoRef.current.muted = true;
                videoRef.current.play().catch(e => console.error('Error autoplay:', e));
            }
        });
    };

    const startScreenShare = async () => {
        try {
            const videoStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always', width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
                audio: false
            });

            if (isMicOn) {
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({
                        audio: { echoCancellation: true, noiseSuppression: true }
                    });
                    audioStream.getTracks().forEach(track => videoStream.addTrack(track));
                } catch (err) {
                    console.warn('Micrófono no disponible');
                }
            }

            localStreamRef.current = videoStream;

            if (videoRef.current) {
                videoRef.current.srcObject = videoStream;
                videoRef.current.muted = true;
                await videoRef.current.play();
            }

            setIsScreenSharing(true);
            videoStream.getVideoTracks()[0].onended = stopScreenShare;
            toast.success('Compartiendo pantalla');

        } catch (error) {
            console.error('Error:', error);
            toast.error('No se pudo compartir pantalla');
        }
    };

    const stopScreenShare = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsScreenSharing(false);
        if (isStreaming) stopStreaming();
    };

    const startCamera = async () => {
        try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
                audio: isMicOn
            });

            localStreamRef.current = cameraStream;

            if (videoRef.current) {
                videoRef.current.srcObject = cameraStream;
                videoRef.current.muted = true;
                await videoRef.current.play();
            }

            setIsCameraOn(true);
            cameraStream.getVideoTracks()[0].onended = stopCamera;
            toast.success('Cámara activada');

        } catch (error) {
            if (error.name === 'NotAllowedError') {
                toast.error('Permiso denegado');
            } else {
                toast.error('No se pudo acceder a la cámara');
            }
        }
    };

    const stopCamera = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(t => t.stop());
            localStreamRef.current = null;
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsCameraOn(false);
        if (isStreaming) stopStreaming();
    };

    const startBroadcast = async () => {
        if (!localStreamRef.current) {
            toast.error('Activa la cámara o comparte pantalla');
            return;
        }
        try {
            await api.post(`/live/streams/${streamId}/start/`);
            setIsStreaming(true);
            toast.success('¡Transmisión iniciada!');
            if (wsRef.current) wsRef.current.send(JSON.stringify({ type: 'stream_started' }));
        } catch (error) {
            toast.error('Error al iniciar');
        }
    };

    const stopStreaming = async () => {
        try {
            await api.post(`/live/streams/${streamId}/end/`);
            setIsStreaming(false);
            callsRef.current.forEach(call => call.close());
            callsRef.current = [];
            if (wsRef.current) wsRef.current.send(JSON.stringify({ type: 'stream_ended' }));

            if (isScreenSharing) stopScreenShare();
            else if (isCameraOn) stopCamera();

            // LIMPIEZA DE CACHÉ CRÍTICA
            await queryClient.invalidateQueries('activeStreams');
            await queryClient.resetQueries('activeStreams');

            toast.success('Transmisión finalizada');
            navigate('/');
        } catch (error) {
            console.error(error);
        }
    };

    const handleCommentSubmit = async (e) => {
        e?.preventDefault();
        if (!newComment.trim()) return;

        if (wsRef.current) {
            wsRef.current.send(JSON.stringify({
                type: 'comment',
                content: newComment
            }));
            setNewComment('');
            setShowEmojiPicker(false);
        }
    };

    const onEmojiClick = (emojiObject) => {
        setNewComment(prev => prev + emojiObject.emoji);
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            try {
                await videoContainerRef.current?.requestFullscreen();
            } catch (err) {
                console.error('Error al entrar en pantalla completa:', err);
                toast.error('No se pudo activar pantalla completa');
            }
        } else {
            try {
                await document.exitFullscreen();
            } catch (err) {
                console.error('Error al salir de pantalla completa:', err);
            }
        }
    };

    const handleDonation = () => {
        window.open('https://www.paypal.com/donate/?business=alexgalanmartin5@gmail.com', '_blank');
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isFullscreen) {
                setShowControls(false);
            }
        }, 3000);
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            const isNowFullscreen = !!document.fullscreenElement;
            if (isNowFullscreen !== isFullscreen) {
                setIsFullscreen(isNowFullscreen);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [isFullscreen]);

    useEffect(() => {
        loadStreamData();
        const token = localStorage.getItem('access_token');
        const ws = new WebSocket(`ws://localhost:8000/ws/live/${streamId}/?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => console.log('WebSocket conectado');
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_comment') {
                setComments(prev => [...prev, data.comment]);
            } else if (data.type === 'viewers_update') {
                setViewersCount(data.count);
            } else if (data.type === 'viewers_list') {
                setConnectedViewers(data.viewers || []);
            } else if (data.type === 'stream_started') {
                setIsStreaming(true);
                if (!isStreamer && peerRef.current) {
                    connectToStreamer(peerRef.current);
                }
            } else if (data.type === 'stream_ended') {
                setIsStreaming(false);
                toast('Transmisión finalizada', { icon: '🏁' });
                if (videoRef.current) videoRef.current.srcObject = null;
                setTimeout(() => navigate('/'), 3000);
            } else if (data.type === 'kicked') {
                toast.error(data.message);
                setTimeout(() => navigate('/'), 2000);
            } else if (data.type === 'system_message') {
                toast(data.message, { icon: '⚙️' });
            }
        };

        return () => ws.close();
    }, [streamId]);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const USER_COLORS = [
        'text-blue-400', 'text-green-400', 'text-yellow-400',
        'text-purple-400', 'text-pink-400', 'text-indigo-400',
        'text-teal-400', 'text-orange-400', 'text-cyan-400', 'text-lime-400',
        'text-rose-400', 'text-fuchsia-400', 'text-violet-400', 'text-sky-400'
    ];

    const getUserColor = (username) => {
        if (!username) return 'text-gray-400';
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % USER_COLORS.length;
        return USER_COLORS[index];
    };

    const getUsernameColor = (comment) => {
        if (comment.user === stream?.streamer) return 'text-[#ff4f4d] font-bold'; // Rojo Streamer
        if (comment.is_mod) return 'text-emerald-400 font-bold'; // Verde Mod
        if (comment.is_vip) return 'text-amber-400 font-bold'; // Dorado VIP

        // Usuarios normales con color aleatorio
        return `${getUserColor(comment.user_username)} font-bold`;
    };

    const getUserBadges = (comment) => {
        const badges = [];

        // Badge Streamer (Corona)
        if (comment.user === stream?.streamer) {
            badges.push(
                <div key="streamer" className="bg-red-500/10 p-0.5 rounded mr-1" title="Streamer">
                    <Crown size={14} className="text-red-500 fill-red-500/20" />
                </div>
            );
        }

        // Badge Mod (Espada)
        if (comment.is_mod) {
            badges.push(
                <div key="mod" className="bg-emerald-500/10 p-0.5 rounded mr-1" title="Moderador">
                    <Sword size={14} className="text-emerald-500 fill-emerald-500/20" />
                </div>
            );
        }

        // Badge VIP (Diamante)
        if (comment.is_vip) {
            badges.push(
                <div key="vip" className="bg-amber-500/10 p-0.5 rounded mr-1" title="VIP">
                    <Gem size={14} className="text-amber-500 fill-amber-500/20" />
                </div>
            );
        }

        return badges;
    };

    return (
        <div className={`h-screen flex flex-col overflow-hidden ${isDark ? 'bg-[#0f0f13] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header / Navbar simplificado para modo inmersivo */}
            <div className={`h-16 flex items-center justify-between px-6 border-b z-20 ${isDark ? 'bg-[#18181b] border-white/5' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-white/10 transition">
                        <LogOut size={20} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">{stream?.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                                <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></span>
                                {isStreaming ? 'EN VIVO' : 'OFFLINE'}
                            </span>
                            <span>•</span>
                            <span className="text-indigo-400 font-medium">@{stream?.streamer_username}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {!isStreamer && (
                        <button
                            onClick={handleDonation}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white rounded-full font-bold transition shadow-lg shadow-yellow-500/20 transform hover:scale-105"
                        >
                            <DollarSign size={18} />
                            <span>Donar</span>
                        </button>
                    )}
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                        <Users size={16} className="text-red-500" />
                        <span className="font-bold font-mono">{viewersCount}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Área Principal de Video */}
                <div className="flex-1 flex flex-col relative bg-black" onMouseMove={handleMouseMove} ref={videoContainerRef}>
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-contain"
                        />

                        {!isStreaming && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f0f13]">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full"></div>
                                    <Video className="w-24 h-24 text-gray-700 relative z-10" />
                                </div>
                                <h2 className="text-2xl font-bold mt-6 text-gray-300">
                                    {isStreamer ? 'Listo para transmitir' : 'Esperando transmisión...'}
                                </h2>
                                <p className="text-gray-500 mt-2">
                                    {isStreamer ? 'Configura tus dispositivos abajo' : 'El streamer comenzará pronto'}
                                </p>
                            </div>
                        )}

                        {/* Overlay de Controles */}
                        <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    {isStreamer && !isStreaming && (
                                        <>
                                            <button
                                                onClick={startScreenShare}
                                                disabled={isCameraOn}
                                                className={`p-3 rounded-full transition ${isScreenSharing ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                                title="Compartir Pantalla"
                                            >
                                                {isScreenSharing ? <Monitor size={24} /> : <MonitorOff size={24} />}
                                            </button>
                                            <button
                                                onClick={isCameraOn ? stopCamera : startCamera}
                                                disabled={isScreenSharing}
                                                className={`p-3 rounded-full transition ${isCameraOn ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                                title="Cámara"
                                            >
                                                {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    {isStreamer ? (
                                        !isStreaming ? (
                                            <button
                                                onClick={startBroadcast}
                                                disabled={!isScreenSharing && !isCameraOn}
                                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                <Video size={20} />
                                                Iniciar Live
                                            </button>
                                        ) : (
                                            <button
                                                onClick={stopStreaming}
                                                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white border border-red-500/50 rounded-full font-bold transition flex items-center gap-2"
                                            >
                                                <X size={20} />
                                                Terminar
                                            </button>
                                        )
                                    ) : null}

                                    <button onClick={toggleFullscreen} className="p-2 text-white hover:text-red-500 transition">
                                        {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel de Chat Lateral - Estilo RED-RED */}
                <div className={`w-[340px] flex flex-col border-l z-10 ${isDark ? 'bg-[#18181b] border-white/5' : 'bg-white border-gray-200'}`}>
                    <div className={`p-3 border-b flex items-center justify-between shadow-sm ${isDark ? 'border-white/5 bg-[#1f1f23]' : 'border-gray-100 bg-white'}`}>
                        <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-gray-400">
                            Chat del Stream
                        </h3>
                        {isStreamer && (
                            <button
                                onClick={() => setShowViewersPanel(!showViewersPanel)}
                                className={`p-1.5 rounded hover:bg-white/10 transition text-gray-400 hover:text-white`}
                                title="Ver espectadores"
                            >
                                <Users size={18} />
                            </button>
                        )}
                    </div>

                    {showViewersPanel && isStreamer ? (
                        <div className="flex-1 overflow-y-auto p-4">
                            <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Usuarios Conectados</h4>
                            <div className="space-y-2">
                                {connectedViewers.map((viewer, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100 border border-gray-200'}`}>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                            {viewer.charAt(0).toUpperCase()}
                                        </div>
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{viewer}</span>
                                    </div>
                                ))}
                                {connectedViewers.length === 0 && (
                                    <p className="text-center text-gray-500 mt-10">Esperando espectadores...</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col min-h-0 relative">
                            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent font-sans">
                                {comments.length > 0 ? (
                                    comments.map((c, i) => (
                                        <div key={i} className={`group py-1 px-2 rounded transition-colors text-[13px] leading-5 break-words ${isDark ? 'hover:bg-white/5 text-gray-100' : 'hover:bg-black/5 text-gray-800'}`}>
                                            <div className="inline align-baseline">
                                                <span className="inline-flex align-middle mr-1.5 relative -top-0.5">
                                                    {getUserBadges(c)}
                                                </span>
                                                <span className={`${getUsernameColor(c)} hover:underline cursor-pointer mr-1`}>
                                                    {c.user_username}
                                                </span>
                                                <span className="text-gray-400 mr-1.5">:</span>
                                                <span className={`${isDark ? 'text-[#efeff1]' : 'text-gray-900'}`}>
                                                    {c.content}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 opacity-50">
                                        <MessageCircle size={32} strokeWidth={1.5} />
                                        <p className="text-sm">Bienvenido al chat</p>
                                    </div>
                                )}
                                <div ref={commentsEndRef} />
                            </div>

                            {/* Emoji Picker Popover */}
                            {showEmojiPicker && (
                                <div className={`absolute bottom-16 right-2 z-50 shadow-2xl rounded-xl overflow-hidden border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                    <EmojiPicker
                                        theme={isDark ? 'dark' : 'light'}
                                        onEmojiClick={onEmojiClick}
                                        width={300}
                                        height={400}
                                        previewConfig={{ showPreview: false }}
                                    />
                                </div>
                            )}

                            <div className={`p-3 ${isDark ? 'bg-[#18181b]' : 'bg-white'}`}>
                                <form onSubmit={handleCommentSubmit} className="relative">
                                    <div className={`relative flex items-center rounded border border-transparent focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all ${isDark
                                            ? 'bg-[#3a3a3d] text-white focus-within:bg-black'
                                            : 'bg-gray-100 text-gray-900 focus-within:bg-white border-gray-200'
                                        }`}>
                                        <input
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            placeholder="Enviar un mensaje"
                                            className="w-full pl-3 pr-10 py-2 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="absolute right-2 p-1 text-gray-400 hover:text-gray-200 transition"
                                        >
                                            <Smile size={20} />
                                        </button>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim()}
                                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Chat
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveStreamPage;
