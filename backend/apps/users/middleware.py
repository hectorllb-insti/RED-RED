from rest_framework.permissions import BasePermission


class IsNotBanned(BasePermission):
    """
    Permission que verifica que el usuario no esté baneado.
    No se aplica a rutas de administración.
    """
    message = 'Tu cuenta ha sido suspendida y no puedes realizar esta acción.'
    
    def has_permission(self, request, view):
        # Si no está autenticado, dejamos que otras permissions manejen eso
        if not request.user or not request.user.is_authenticated:
            return True
        
        # No aplicar a rutas de administración (admins y moderadores pueden operar)
        if hasattr(request.user, 'is_staff_member') and request.user.is_staff_member():
            return True
        
        # Verificar si está baneado
        if hasattr(request.user, 'is_banned') and request.user.is_banned:
            ban_reason = getattr(request.user, 'ban_reason', 'Sin razón especificada')
            self.message = f'Tu cuenta ha sido suspendida. Razón: {ban_reason}'
            return False
        
        return True
