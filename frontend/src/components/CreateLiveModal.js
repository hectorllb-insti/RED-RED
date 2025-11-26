import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from 'react-query';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const CreateLiveModal = ({ onClose }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { actualTheme } = useTheme();
    const isDark = actualTheme === 'dark';

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const createStreamMutation = useMutation(
        async (streamData) => {
            const response = await api.post('/live/streams/', streamData);
            return response.data;
        },
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries('activeStreams');
                queryClient.resetQueries('activeStreams');
                toast.success('¡Directo creado!');
                navigate(`/live/${data.id}`);
            },
            onError: (error) => {
                toast.error(error.response?.data?.error || 'Error al crear el directo');
            },
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        createStreamMutation.mutate({
            title: title.trim() || 'Transmisión en vivo',
            description: description.trim(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div
                className={`rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-slate-800' : 'bg-white'
                    }`}
            >
                {/* Header */}
                <div className={`sticky top-0 p-6 border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'} z-10`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl">
                                <Video className="h-6 w-6 text-white" />
                            </div>
                            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Crear Directo
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-colors ${isDark
                                ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label
                            htmlFor="title"
                            className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-700'
                                }`}
                        >
                            Título del directo
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Jugando mi juego favorito"
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${isDark
                                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                }`}
                            maxLength={200}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor="description"
                            className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-gray-700'
                                }`}
                        >
                            Descripción (opcional)
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Cuéntale a tu audiencia de qué va tu directo..."
                            rows="4"
                            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all ${isDark
                                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                }`}
                            maxLength={500}
                        />
                    </div>

                    {/* Info Box */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-blue-900'}`}>
                            <strong>Nota:</strong> Podrás compartir tu pantalla o usar tu cámara una vez creado el directo.
                            Tus seguidores recibirán una notificación cuando inicies la transmisión.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${isDark
                                ? 'bg-slate-700 text-white hover:bg-slate-600'
                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                }`}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={createStreamMutation.isLoading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg transition-all"
                        >
                            {createStreamMutation.isLoading ? 'Creando...' : 'Crear Directo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateLiveModal;
