from rest_framework.permissions import BasePermission

class IsOrganizer(BasePermission):
    """Allow access only to users with user_type='organizer'."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and getattr(request.user, 'user_type', None) == 'organizer'