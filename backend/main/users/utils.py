# users/utils.py
from django.conf import settings
from django.core.cache import cache
from .models import CustomUser


def get_user_permissions(user: CustomUser):
    """
    Retrieves all permissions for a given user, utilizing a cache
    to improve performance.
    """
    cache_key = f"user_{user.id}_permissions"
    permissions = cache.get(cache_key)

    if permissions is None:
        # If permissions are not in the cache, fetch from the database
        permissions = set()
        # Get permissions from user's roles
        for role in user.roles.all():
            for perm in role.permissions.all():
                permissions.add(perm.codename)

        # Get permissions directly assigned to the user
        for perm in user.user_permissions.all():
            permissions.add(perm.codename)

        # Store the permissions in the cache
        cache.set(cache_key, permissions, timeout=settings.USER_PERMISSIONS_CACHE_TIMEOUT)

    return permissions


def clear_user_permissions_cache(user_id: int):
    """
    Clears the permissions cache for a specific user.
    """
    cache.delete(f"user_{user_id}_permissions")