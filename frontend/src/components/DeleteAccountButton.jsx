import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/services/api';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Componente para eliminar la cuenta del usuario
 * Incluye validaciones de seguridad y confirmación doble
 */
const DeleteAccountButton = () => {
  const [password, setPassword] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();

  // Mutation para eliminar cuenta
  const deleteAccountMutation = useMutation({
    mutationFn: async (password) => {
      const response = await api.delete('/api/users/profile/delete/', {
        data: { password }
      });
      return response.data;
    },
    onSuccess: (data) => {
      console.log(data.message);
      
      // Limpiar todos los datos de sesión
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Redirigir a página de despedida o landing
      navigate('/', { 
        state: { 
          message: 'Tu cuenta ha sido eliminada exitosamente. ¡Esperamos verte pronto!' 
        } 
      });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Error al eliminar la cuenta';
      setError(errorMessage);
    }
  });

  const handleDelete = () => {
    // Resetear error
    setError('');

    // Validaciones
    if (!password) {
      setError('Debes ingresar tu contraseña');
      return;
    }

    if (!confirmChecked) {
      setError('Debes confirmar que entiendes que esta acción es irreversible');
      return;
    }

    // Ejecutar eliminación
    deleteAccountMutation.mutate(password);
  };

  const handleCancel = () => {
    setPassword('');
    setConfirmChecked(false);
    setError('');
    setShowDialog(false);
  };

  return (
    <div className="border border-red-200 rounded-lg p-6 bg-red-50">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-red-100 rounded-full">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Zona de Peligro
          </h3>
          <p className="text-sm text-red-700 mb-4">
            Eliminar tu cuenta es una acción permanente e irreversible. 
            Todos tus datos, incluyendo posts, comentarios, mensajes y 
            relaciones sociales serán eliminados de forma permanente.
          </p>

          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="gap-2"
                disabled={deleteAccountMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
                Eliminar mi cuenta
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  ¿Estás absolutamente seguro?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Esta acción <strong>no se puede deshacer</strong>. 
                    Esto eliminará permanentemente tu cuenta y removerá 
                    todos tus datos de nuestros servidores.
                  </p>

                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-xs text-yellow-800 font-medium mb-2">
                      Se eliminarán:
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                      <li>Todos tus posts y comentarios</li>
                      <li>Tus mensajes y conversaciones</li>
                      <li>Tus relaciones de seguimiento</li>
                      <li>Tu perfil e información personal</li>
                      <li>Tus historias y contenido multimedia</li>
                    </ul>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div>
                      <Label htmlFor="password" className="text-sm font-medium">
                        Confirma tu contraseña
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Ingresa tu contraseña actual"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1"
                        disabled={deleteAccountMutation.isPending}
                      />
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox
                        id="confirm"
                        checked={confirmChecked}
                        onCheckedChange={setConfirmChecked}
                        disabled={deleteAccountMutation.isPending}
                      />
                      <Label 
                        htmlFor="confirm" 
                        className="text-xs text-gray-600 cursor-pointer leading-tight"
                      >
                        Entiendo que esta acción es permanente y que 
                        todos mis datos serán eliminados sin posibilidad 
                        de recuperación.
                      </Label>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription className="text-sm">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel 
                  onClick={handleCancel}
                  disabled={deleteAccountMutation.isPending}
                >
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                  disabled={deleteAccountMutation.isPending}
                >
                  {deleteAccountMutation.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Sí, eliminar mi cuenta
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountButton;
