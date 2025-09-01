from rest_framework import serializers
from .models import UserEvent, UserSession, FeatureUsage, UserEngagementMetrics, RetentionCohort


class UserEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserEvent
        fields = [
            'id', 'event_type', 'event_data', 'timestamp',
            'session_id', 'ip_address', 'user_agent', 'referrer'
        ]
        read_only_fields = ['id', 'timestamp']


class UserSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSession
        fields = [
            'id', 'session_id', 'start_time', 'end_time', 
            'duration_seconds', 'page_views', 'events_count',
            'device_type'
        ]
        read_only_fields = ['id', 'duration_seconds']


class FeatureUsageSerializer(serializers.ModelSerializer):
    feature_display = serializers.CharField(source='get_feature_display', read_only=True)
    
    class Meta:
        model = FeatureUsage
        fields = [
            'id', 'feature', 'feature_display', 'first_used', 
            'last_used', 'usage_count', 'total_time_seconds'
        ]
        read_only_fields = ['id', 'first_used', 'last_used', 'usage_count', 'total_time_seconds']


class UserEngagementMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserEngagementMetrics
        fields = [
            'id', 'registration_date', 'last_active_date', 
            'total_sessions', 'total_session_time_seconds',
            'days_since_registration', 'days_active',
            'habits_created', 'habits_completed', 'current_active_habits',
            'longest_streak', 'total_streak_days', 'insurance_used', 'comebacks_count',
            'activity_score', 'habit_consistency_score', 
            'feature_adoption_score', 'retention_risk_score',
            'features_discovered', 'features_actively_used',
            'milestones_reached', 'badges_earned', 'reports_generated',
            'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


class RetentionCohortSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetentionCohort
        fields = [
            'id', 'cohort_type', 'cohort_date', 'period',
            'total_users', 'active_users', 'retention_rate'
        ]
        read_only_fields = ['id']


class EventTrackingSerializer(serializers.Serializer):
    """Serializer for tracking events via API"""
    event_type = serializers.ChoiceField(choices=UserEvent.EVENT_TYPES)
    event_data = serializers.JSONField(default=dict, required=False)
    session_id = serializers.CharField(max_length=100, required=False)
    page_path = serializers.CharField(max_length=500, required=False)
    
    def validate_event_type(self, value):
        valid_types = [choice[0] for choice in UserEvent.EVENT_TYPES]
        if value not in valid_types:
            raise serializers.ValidationError(f"Invalid event type. Must be one of: {valid_types}")
        return value


class AnalyticsSummarySerializer(serializers.Serializer):
    """Serializer for analytics summary data"""
    engagement_metrics = serializers.DictField()
    activity_stats = serializers.DictField()
    habit_stats = serializers.DictField()
    feature_adoption = serializers.DictField()
    recent_activity = serializers.DictField()


class AnalyticsDashboardSerializer(serializers.Serializer):
    """Serializer for analytics dashboard data"""
    total_users = serializers.IntegerField()
    active_users_today = serializers.IntegerField()
    active_users_week = serializers.IntegerField()
    active_users_month = serializers.IntegerField()
    new_registrations_today = serializers.IntegerField()
    new_registrations_week = serializers.IntegerField()
    new_registrations_month = serializers.IntegerField()
    avg_session_duration = serializers.FloatField()
    avg_engagement_score = serializers.FloatField()
    top_features = serializers.ListField()
    retention_rates = serializers.DictField()
    event_counts = serializers.DictField()