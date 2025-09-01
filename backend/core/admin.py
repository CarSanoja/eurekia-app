from django.contrib import admin
from .models import Course, Enrollment, Resource, AccessRule


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'code', 'visibility', 'start_date', 'end_date', 'created_at']
    list_filter = ['visibility', 'created_at']
    search_fields = ['title', 'code']
    prepopulated_fields = {'code': ('title',)}


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'role', 'enrolled_at']
    list_filter = ['role', 'enrolled_at']
    search_fields = ['user__email', 'course__title']


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'type', 'visibility', 'order']
    list_filter = ['type', 'visibility', 'course']
    search_fields = ['title', 'course__title']


@admin.register(AccessRule)
class AccessRuleAdmin(admin.ModelAdmin):
    list_display = ['resource', 'course', 'audience']
    list_filter = ['audience', 'course']
