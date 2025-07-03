from rest_framework import permissions

from users.models import Role


class IsOrganizer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role(Role.EVENT_ORGANIZER)

class IsVendor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role(Role.SERVICE_PROVIDER)

class IsArtist(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.has_role(Role.ARTIST)