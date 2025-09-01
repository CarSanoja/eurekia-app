from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ContactMethod, ChannelPreference, Role, UserRole


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'name', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'date_joined']
    search_fields = ['email', 'name']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'name')}),
        ('Avatar', {'fields': ('avatar_icon', 'avatar_color')}),
        ('Settings', {'fields': ('locale', 'class_code')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'is_staff', 'is_active'),
        }),
    )


@admin.register(ContactMethod)
class ContactMethodAdmin(admin.ModelAdmin):
    list_display = ['user', 'channel', 'address', 'verified', 'consent']
    list_filter = ['channel', 'verified', 'consent']
    search_fields = ['user__email', 'address']


@admin.register(ChannelPreference)
class ChannelPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'primary', 'allow_prompts']
    list_filter = ['primary', 'allow_prompts']


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['key', 'name']


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'granted_at']
    list_filter = ['role', 'granted_at']
