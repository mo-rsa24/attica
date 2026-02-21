from __future__ import annotations

from rest_framework import permissions


ORGANIZER_ROLE_NAMES = {"EVENT_ORGANIZER", "ORGANIZER"}
PROVIDER_ROLE_NAMES = {"VENUE", "VENUE_MANAGER", "ARTIST", "VENDOR", "SERVICE_PROVIDER"}
ADMIN_ROLE_NAMES = {"ADMIN"}


def _has_any_role(user, allowed_names):
    if not getattr(user, "is_authenticated", False):
        return False
    if not hasattr(user, "roles"):
        return False
    return user.roles.filter(name__in=allowed_names).exists()


def is_admin(user):
    return (
        getattr(user, "is_authenticated", False)
        and (user.is_superuser or user.is_staff or _has_any_role(user, ADMIN_ROLE_NAMES))
    )


def is_organizer(user):
    return getattr(user, "is_authenticated", False) and (
        getattr(user, "user_type", None) == "organizer"
        or _has_any_role(user, ORGANIZER_ROLE_NAMES)
    )


def is_provider(user):
    return getattr(user, "is_authenticated", False) and (
        getattr(user, "user_type", None) in {"vendor", "artist", "venue"}
        or _has_any_role(user, PROVIDER_ROLE_NAMES)
    )


def can_manage_resource(user, resource):
    if is_admin(user):
        return True
    return getattr(user, "id", None) == resource.owner_id


def can_manage_event(user, event):
    if is_admin(user):
        return True
    return getattr(user, "id", None) in {event.user_id, event.organizer_id}


class IsAuthenticatedOrAdminReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated


class IsSchedulingAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and is_admin(request.user))
