from django.contrib import admin
from .models import Mission, Vision, Habit, Checkin, Mood, Trigger, EnvPledge, PlanIfThen, Badge


@admin.register(Mission)
class MissionAdmin(admin.ModelAdmin):
    list_display = ['user', 'skill', 'weakness', 'updated_at']
    search_fields = ['user__email', 'skill', 'weakness']


@admin.register(Vision)
class VisionAdmin(admin.ModelAdmin):
    list_display = ['user', 'tags', 'updated_at']
    search_fields = ['user__email', 'summary']


@admin.register(Habit)
class HabitAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'cadence', 'difficulty_level', 'is_active', 'created_at']
    list_filter = ['cadence', 'difficulty_level', 'is_active', 'created_at']
    search_fields = ['title', 'user__email']


@admin.register(Checkin)
class CheckinAdmin(admin.ModelAdmin):
    list_display = ['habit', 'date', 'value', 'used_insurance', 'channel']
    list_filter = ['value', 'used_insurance', 'channel', 'date']
    search_fields = ['habit__title', 'habit__user__email']
    date_hierarchy = 'date'


@admin.register(Mood)
class MoodAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'score', 'channel']
    list_filter = ['score', 'channel', 'date']
    search_fields = ['user__email', 'note']
    date_hierarchy = 'date'


@admin.register(Trigger)
class TriggerAdmin(admin.ModelAdmin):
    list_display = ['user', 'text', 'tags', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'text', 'response']


@admin.register(EnvPledge)
class EnvPledgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'text', 'cadence', 'last_checkin_date']
    list_filter = ['cadence']
    search_fields = ['user__email', 'text']


@admin.register(PlanIfThen)
class PlanIfThenAdmin(admin.ModelAdmin):
    list_display = ['user', 'situation', 'action', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__email', 'situation', 'action']


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'awarded_at']
    list_filter = ['type', 'awarded_at']
    search_fields = ['user__email']
