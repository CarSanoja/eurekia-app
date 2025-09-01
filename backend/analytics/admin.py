from django.contrib import admin
from django.utils.html import format_html
from django.db import models
from .models import UserEvent, UserSession, FeatureUsage, UserEngagementMetrics, RetentionCohort


@admin.register(UserEvent)
class UserEventAdmin(admin.ModelAdmin):
    list_display = ['user', 'event_type', 'timestamp', 'session_id', 'device_info']
    list_filter = ['event_type', 'timestamp', 'user']
    search_fields = ['user__email', 'user__name', 'event_type', 'session_id']
    readonly_fields = ['timestamp']
    date_hierarchy = 'timestamp'
    
    def device_info(self, obj):
        if obj.user_agent:
            # Simple device detection for display
            agent = obj.user_agent.lower()
            if 'mobile' in agent or 'android' in agent or 'iphone' in agent:
                return format_html('<span style="color: #28a745;">📱 Mobile</span>')
            elif 'tablet' in agent or 'ipad' in agent:
                return format_html('<span style="color: #17a2b8;">📱 Tablet</span>')
            else:
                return format_html('<span style="color: #6c757d;">💻 Desktop</span>')
        return '-'
    device_info.short_description = 'Device'
    
    def has_change_permission(self, request, obj=None):
        return False  # Events should not be editable


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'session_id_short', 'start_time', 'duration_display', 
                   'page_views', 'events_count', 'device_type']
    list_filter = ['device_type', 'start_time']
    search_fields = ['user__email', 'user__name', 'session_id']
    readonly_fields = ['session_id', 'start_time', 'end_time', 'duration_seconds']
    
    def session_id_short(self, obj):
        return f"{obj.session_id[:8]}..."
    session_id_short.short_description = 'Session ID'
    
    def duration_display(self, obj):
        if obj.duration_seconds:
            minutes = obj.duration_seconds // 60
            seconds = obj.duration_seconds % 60
            return f"{minutes}m {seconds}s"
        return '-'
    duration_display.short_description = 'Duration'
    
    def has_change_permission(self, request, obj=None):
        return False  # Sessions should not be editable


@admin.register(FeatureUsage)
class FeatureUsageAdmin(admin.ModelAdmin):
    list_display = ['user', 'feature', 'usage_count', 'first_used', 'last_used', 'time_spent_display']
    list_filter = ['feature', 'first_used', 'last_used']
    search_fields = ['user__email', 'user__name', 'feature']
    readonly_fields = ['first_used', 'last_used', 'usage_count', 'total_time_seconds']
    
    def time_spent_display(self, obj):
        if obj.total_time_seconds:
            hours = obj.total_time_seconds // 3600
            minutes = (obj.total_time_seconds % 3600) // 60
            return f"{hours}h {minutes}m"
        return '-'
    time_spent_display.short_description = 'Total Time'


@admin.register(UserEngagementMetrics)
class UserEngagementMetricsAdmin(admin.ModelAdmin):
    list_display = ['user', 'activity_score_display', 'habit_consistency_score_display', 
                   'feature_adoption_score_display', 'retention_risk_display', 'last_active_date']
    list_filter = ['activity_score', 'habit_consistency_score', 'feature_adoption_score', 
                  'retention_risk_score', 'last_active_date']
    search_fields = ['user__email', 'user__name']
    readonly_fields = ['registration_date', 'days_since_registration', 'updated_at']
    
    fieldsets = (
        ('User Info', {
            'fields': ('user', 'registration_date', 'last_active_date', 'days_since_registration')
        }),
        ('Activity Metrics', {
            'fields': ('total_sessions', 'total_session_time_seconds', 'days_active')
        }),
        ('Habit Metrics', {
            'fields': ('habits_created', 'habits_completed', 'current_active_habits',
                      'longest_streak', 'total_streak_days', 'insurance_used', 'comebacks_count')
        }),
        ('Engagement Scores', {
            'fields': ('activity_score', 'habit_consistency_score', 
                      'feature_adoption_score', 'retention_risk_score')
        }),
        ('Feature Adoption', {
            'fields': ('features_discovered', 'features_actively_used')
        }),
        ('Achievements', {
            'fields': ('milestones_reached', 'badges_earned', 'reports_generated')
        }),
    )
    
    def activity_score_display(self, obj):
        score = obj.activity_score
        if score >= 80:
            color = '#28a745'  # Green
        elif score >= 60:
            color = '#ffc107'  # Yellow
        elif score >= 40:
            color = '#fd7e14'  # Orange
        else:
            color = '#dc3545'  # Red
        return format_html(f'<span style="color: {color}; font-weight: bold;">{score:.1f}</span>')
    activity_score_display.short_description = 'Activity'
    
    def habit_consistency_score_display(self, obj):
        score = obj.habit_consistency_score
        if score >= 80:
            color = '#28a745'
        elif score >= 60:
            color = '#ffc107'
        elif score >= 40:
            color = '#fd7e14'
        else:
            color = '#dc3545'
        return format_html(f'<span style="color: {color}; font-weight: bold;">{score:.1f}</span>')
    habit_consistency_score_display.short_description = 'Habit Consistency'
    
    def feature_adoption_score_display(self, obj):
        score = obj.feature_adoption_score
        if score >= 80:
            color = '#28a745'
        elif score >= 60:
            color = '#ffc107'
        elif score >= 40:
            color = '#fd7e14'
        else:
            color = '#dc3545'
        return format_html(f'<span style="color: {color}; font-weight: bold;">{score:.1f}</span>')
    feature_adoption_score_display.short_description = 'Feature Adoption'
    
    def retention_risk_display(self, obj):
        score = obj.retention_risk_score
        if score <= 20:
            color = '#28a745'  # Low risk
        elif score <= 40:
            color = '#ffc107'  # Medium risk
        elif score <= 60:
            color = '#fd7e14'  # High risk
        else:
            color = '#dc3545'  # Very high risk
        return format_html(f'<span style="color: {color}; font-weight: bold;">{score:.1f}</span>')
    retention_risk_display.short_description = 'Retention Risk'


@admin.register(RetentionCohort)
class RetentionCohortAdmin(admin.ModelAdmin):
    list_display = ['cohort_type', 'cohort_date', 'period', 'total_users', 
                   'active_users', 'retention_rate_display']
    list_filter = ['cohort_type', 'cohort_date', 'period']
    search_fields = ['cohort_date']
    
    def retention_rate_display(self, obj):
        rate = obj.retention_rate
        if rate >= 50:
            color = '#28a745'  # Green
        elif rate >= 30:
            color = '#ffc107'  # Yellow
        elif rate >= 15:
            color = '#fd7e14'  # Orange
        else:
            color = '#dc3545'  # Red
        return format_html(f'<span style="color: {color}; font-weight: bold;">{rate:.1f}%</span>')
    retention_rate_display.short_description = 'Retention Rate'
    
    def has_change_permission(self, request, obj=None):
        return False  # Cohort data should not be editable manually