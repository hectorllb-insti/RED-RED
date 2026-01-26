from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a administradores.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin()


class IsModerator(permissions.BasePermission):
    """
    Permiso personalizado para permitir a moderadores y administradores.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_staff_member()


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso que permite lectura a todos pero escritura solo a administradores.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_admin()
