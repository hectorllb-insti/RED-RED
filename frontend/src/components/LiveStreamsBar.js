import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users } from 'lucide-react';
import { useQuery } from 'react-query';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const LiveStreamsBar = () => {
    const navigate = useNavigate();
    const { actualTheme } = useTheme();
    const isDark = actualTheme === 'dark';

    // Obtener streams activos
    const { data: liveStreams, refetch } = useQuery(
        'activeStreams',
        async () => {
            const response = await api.get('/live/streams/active/');
            return response.data;
        },
        {
            refetchInterval: 10000, // Refrescar cada 10 segundos
            staleTime: 5000,
        }
    );

    const handleStreamClick = (streamId) => {
        navigate(`/live/${streamId}`);
    };

    if (!liveStreams || liveStreams.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-4 min-w-max">
            {liveStreams.map((stream) => (
                <button
                    key={stream.id}
                    onClick={() => handleStreamClick(stream.id)}
                    className="flex flex-col items-center gap-2 group relative"
                >
                    {/* Live Indicator Ring */}
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-red-600 via-red-500 to-pink-500 animate-pulse">
                            <div className="w-full h-full rounded-full border-2 border-white dark:border-slate-800 overflow-hidden">
                                <img
                                    src={getImageUrl(stream.streamer_profile_picture) || '/default-avatar.png'}
                                    alt={stream.streamer_first_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Live Badge */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            EN VIVO
                        </div>
                    </div>

                    {/* Streamer Name */}
                    <div className="text-center">
                        <span className="text-xs font-medium truncate w-16 block text-gray-900 dark:text-white">
                            {stream.streamer_first_name}
                        </span>

                        {/* Viewers Count */}
                        {stream.viewers_count > 0 && (
                            <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                <Users className="h-3 w-3" />
                                <span>{stream.viewers_count}</span>
                            </div>
                        )}
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 rounded-full bg-red-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </button>
            ))}
        </div>
    );
};

export default LiveStreamsBar;
