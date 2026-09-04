from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Role, OrganizationMembership

class OrganizationMembershipInline(admin.TabularInline):
    model = OrganizationMembership
    extra = 1

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'primary_role', 'is_active', 'is_staff')
    list_filter = ('primary_role', 'is_active', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Healthcare Role & Scope', {'fields': ('primary_role', 'phone_number', 'avatar_url')}),
    )
    inlines = [OrganizationMembershipInline]

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('code', 'name')

@admin.register(OrganizationMembership)
class OrganizationMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'organization', 'facility', 'role', 'is_primary')
    list_filter = ('organization', 'role')
