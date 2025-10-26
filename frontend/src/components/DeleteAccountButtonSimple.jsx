import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './DeleteAccountButton.css';

/**
 * Componente simple para eliminar cuenta (sin dependencias de UI)
 */
const DeleteAccountButtonSimple = () => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Mutation para eliminar cuenta
  const deleteAccountMutation = useMutation({
    mutationFn: async (password) => {
      const response = await api.delete('/users/profile/delete/', {
        data: { password }
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Tu cuenta ha sido eliminada exitosamente');
      
      // Limpiar sesión usando el método de logout del contexto
      logout();
      
      // Redirigir inmediatamente a login
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Error al eliminar la cuenta';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Debes ingresar tu contraseña');
      return;
    }

    if (!confirmChecked) {
      setError('Debes confirmar que entiendes que esta acción es irreversible');
      return;
    }

    if (!window.confirm('¿ESTÁS COMPLETAMENTE SEGURO? Esta acción NO se puede deshacer.')) {
      return;
    }

    deleteAccountMutation.mutate(password);
  };

  const handleClose = () => {
    setShowModal(false);
    setPassword('');
    setConfirmChecked(false);
    setError('');
  };

  return (
    <>
      <div className="delete-account-section">
        <div className="danger-zone">
          <h3>⚠️ Zona de Peligro</h3>
          <p>
            Eliminar tu cuenta es una acción <strong>permanente e irreversible</strong>. 
            Todos tus datos serán eliminados de forma permanente.
          </p>
          <button 
            className="btn-danger"
            onClick={() => setShowModal(true)}
            disabled={deleteAccountMutation.isPending}
          >
            🗑️ Eliminar mi cuenta
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Eliminar cuenta</h2>
              <button className="close-btn" onClick={handleClose}>×</button>
            </div>

            <div className="modal-body">
              <div className="warning-box">
                <p><strong>Esta acción no se puede deshacer.</strong></p>
                <p>Se eliminarán permanentemente:</p>
                <ul>
                  <li>✗ Todos tus posts y comentarios</li>
                  <li>✗ Tus mensajes y conversaciones</li>
                  <li>✗ Tus relaciones de seguimiento</li>
                  <li>✗ Tu perfil e información personal</li>
                  <li>✗ Tus historias y contenido multimedia</li>
                </ul>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="password">
                    Confirma tu contraseña:
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña actual"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={deleteAccountMutation.isPending}
                    required
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={confirmChecked}
                      onChange={(e) => setConfirmChecked(e.target.checked)}
                      disabled={deleteAccountMutation.isPending}
                      required
                    />
                    <span>
                      Entiendo que esta acción es permanente y que todos 
                      mis datos serán eliminados sin posibilidad de recuperación.
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="error-message">
                    ❌ {error}
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleClose}
                    disabled={deleteAccountMutation.isPending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-danger"
                    disabled={deleteAccountMutation.isPending || !password || !confirmChecked}
                  >
                    {deleteAccountMutation.isPending ? (
                      '⏳ Eliminando...'
                    ) : (
                      '🗑️ Sí, eliminar mi cuenta'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteAccountButtonSimple;
