# users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Role, UserProfile

class UserProfileInline(admin.StackedInline):
    """
    Inline admin for UserProfile to be displayed in CustomUser admin.
    """
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'

class CustomUserAdmin(UserAdmin):
    """
    Custom admin for the CustomUser model.
    """
    inlines = (UserProfileInline, )
    # Corrected list_select_related from 'userprofile' to 'profile'
    list_select_related = ('profile',)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_roles')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', 'roles')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

    def get_roles(self, instance):
        return ", ".join([role.name for role in instance.roles.all()])
    get_roles.short_description = 'Roles'

    def get_inline_instances(self, request, obj=None):
        if not obj:
            return list()
        return super(CustomUserAdmin, self).get_inline_instances(request, obj)

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """
    Admin for the Role model.
    """
    list_display = ('name',)
    search_fields = ('name',)

admin.site.register(CustomUser, CustomUserAdmin)