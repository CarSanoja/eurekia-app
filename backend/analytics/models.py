from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class UserEvent(models.Model):
    EVENT_TYPES = [
        # Authentication Events
        ('user_registered', 'User Registered'),
        ('user_login', 'User Login'),
        ('user_logout', 'User Logout'),
        
        # Habit Events
        ('habit_created', 'Habit Created'),
        ('habit_completed', 'Habit Completed'),
        ('habit_skipped', 'Habit Skipped'),
        ('habit_edited', 'Habit Edited'),
        ('habit_deleted', 'Habit Deleted'),
        ('streak_milestone', 'Streak Milestone Reached'),
        ('insurance_used', 'Streak Insurance Used'),
        ('comeback_detected', 'User Comeback Detected'),
        
        # Mission & Vision Events
        ('mission_created', 'Mission Created'),
        ('mission_updated', 'Mission Updated'),
        ('vision_created', 'Vision Created'),
        ('vision_updated', 'Vision Updated'),
        
        # Mood Events
        ('mood_recorded', 'Mood Recorded'),
        ('trigger_recorded', 'Trigger Recorded'),
        
        # Engagement Events
        ('page_view', 'Page View'),
        ('feature_used', 'Feature Used'),
        ('notification_clicked', 'Notification Clicked'),
        ('report_generated', 'Report Generated'),
        ('settings_changed', 'Settings Changed'),
        
        # Gamification Events
        ('badge_earned', 'Badge Earned'),
        ('milestone_celebrated', 'Milestone Celebrated'),
        ('achievement_unlocked', 'Achievement Unlocked'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    event_data = models.JSONField(default=dict, blank=True)
    session_id = models.CharField(max_length=100, null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    referrer = models.URLField(blank=True)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    
    class Meta:
        db_table = 'user_events'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'event_type']),
            models.Index(fields=['event_type', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.event_type} - {self.timestamp}"


class UserSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    session_id = models.CharField(max_length=100, unique=True)
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    page_views = models.PositiveIntegerField(default=0)
    events_count = models.PositiveIntegerField(default=0)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    device_type = models.CharField(max_length=50, blank=True)  # mobile, tablet, desktop
    
    class Meta:
        db_table = 'user_sessions'
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['user', 'start_time']),
            models.Index(fields=['session_id']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - Session {self.session_id[:8]}"
    
    def calculate_duration(self):
        if self.end_time:
            delta = self.end_time - self.start_time
            self.duration_seconds = int(delta.total_seconds())
            self.save(update_fields=['duration_seconds'])


class FeatureUsage(models.Model):
    FEATURES = [
        ('habits', 'Habits Management'),
        ('mood_tracking', 'Mood Tracking'),
        ('mission_vision', 'Mission & Vision'),
        ('reports', 'Reports Generation'),
        ('streak_insurance', 'Streak Insurance'),
        ('notifications', 'Notifications'),
        ('dashboard', 'Dashboard'),
        ('onboarding', 'Onboarding'),
        ('settings', 'Settings'),
        ('admin_studio', 'Admin Studio'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='feature_usage')
    feature = models.CharField(max_length=50, choices=FEATURES)
    first_used = models.DateTimeField(default=timezone.now)
    last_used = models.DateTimeField(default=timezone.now)
    usage_count = models.PositiveIntegerField(default=1)
    total_time_seconds = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'feature_usage'
        unique_together = ['user', 'feature']
        indexes = [
            models.Index(fields=['user', 'feature']),
            models.Index(fields=['feature', 'usage_count']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.feature} - {self.usage_count} uses"


class UserEngagementMetrics(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='engagement_metrics')
    
    # Registration & Activity
    registration_date = models.DateTimeField()
    last_active_date = models.DateTimeField(null=True, blank=True)
    total_sessions = models.PositiveIntegerField(default=0)
    total_session_time_seconds = models.PositiveIntegerField(default=0)
    days_since_registration = models.PositiveIntegerField(default=0)
    days_active = models.PositiveIntegerField(default=0)
    
    # Habit Metrics
    habits_created = models.PositiveIntegerField(default=0)
    habits_completed = models.PositiveIntegerField(default=0)
    current_active_habits = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    total_streak_days = models.PositiveIntegerField(default=0)
    insurance_used = models.PositiveIntegerField(default=0)
    comebacks_count = models.PositiveIntegerField(default=0)
    
    # Engagement Scores (0-100)
    activity_score = models.FloatField(default=0.0)  # Based on daily activity
    habit_consistency_score = models.FloatField(default=0.0)  # Based on habit completion
    feature_adoption_score = models.FloatField(default=0.0)  # Based on features used
    retention_risk_score = models.FloatField(default=0.0)  # Risk of churning (0 = low risk, 100 = high risk)
    
    # Feature Adoption
    features_discovered = models.PositiveIntegerField(default=0)
    features_actively_used = models.PositiveIntegerField(default=0)  # Used in last 7 days
    
    # Milestones & Achievements
    milestones_reached = models.PositiveIntegerField(default=0)
    badges_earned = models.PositiveIntegerField(default=0)
    reports_generated = models.PositiveIntegerField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_engagement_metrics'
        indexes = [
            models.Index(fields=['activity_score']),
            models.Index(fields=['retention_risk_score']),
            models.Index(fields=['last_active_date']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - Engagement Metrics"
    
    def calculate_scores(self):
        """Calculate various engagement scores"""
        now = timezone.now()
        
        # Days since registration
        self.days_since_registration = (now.date() - self.registration_date.date()).days
        
        # Activity Score (based on recent activity)
        if self.last_active_date:
            days_since_active = (now - self.last_active_date).days
            if days_since_active <= 1:
                self.activity_score = 100
            elif days_since_active <= 7:
                self.activity_score = max(0, 100 - (days_since_active * 10))
            else:
                self.activity_score = max(0, 50 - days_since_active)
        
        # Habit Consistency Score
        if self.habits_created > 0:
            completion_rate = (self.habits_completed / max(self.habits_created, 1)) * 100
            streak_bonus = min(self.longest_streak * 2, 50)
            self.habit_consistency_score = min(100, completion_rate + streak_bonus)
        
        # Feature Adoption Score
        total_features = len(FeatureUsage.FEATURES)
        adoption_rate = (self.features_discovered / total_features) * 100
        active_usage_bonus = (self.features_actively_used / max(self.features_discovered, 1)) * 20
        self.feature_adoption_score = min(100, adoption_rate + active_usage_bonus)
        
        # Retention Risk Score (inverse of engagement)
        engagement_avg = (self.activity_score + self.habit_consistency_score + self.feature_adoption_score) / 3
        self.retention_risk_score = max(0, 100 - engagement_avg)
        
        self.save()


class RetentionCohort(models.Model):
    COHORT_TYPES = [
        ('daily', 'Daily Cohort'),
        ('weekly', 'Weekly Cohort'),
        ('monthly', 'Monthly Cohort'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cohort_type = models.CharField(max_length=10, choices=COHORT_TYPES)
    cohort_date = models.DateField()
    period = models.PositiveIntegerField()  # Days/weeks/months since cohort date
    total_users = models.PositiveIntegerField(default=0)
    active_users = models.PositiveIntegerField(default=0)
    retention_rate = models.FloatField(default=0.0)  # Percentage
    
    class Meta:
        db_table = 'retention_cohorts'
        unique_together = ['cohort_type', 'cohort_date', 'period']
        indexes = [
            models.Index(fields=['cohort_type', 'cohort_date']),
            models.Index(fields=['retention_rate']),
        ]
    
    def __str__(self):
        return f"{self.cohort_type.title()} Cohort {self.cohort_date} - Period {self.period}"