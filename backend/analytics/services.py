from django.utils import timezone
from django.db import models
from django.contrib.auth import get_user_model
from .models import UserEvent, UserSession, FeatureUsage, UserEngagementMetrics, RetentionCohort
from datetime import datetime, timedelta
import uuid
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class AnalyticsService:
    """Service class for handling analytics operations"""
    
    @staticmethod
    def track_event(user, event_type, event_data=None, session_id=None, 
                   ip_address=None, user_agent=None, referrer=None):
        """Track a user event"""
        try:
            event = UserEvent.objects.create(
                user=user,
                event_type=event_type,
                event_data=event_data or {},
                session_id=session_id,
                ip_address=ip_address,
                user_agent=user_agent,
                referrer=referrer
            )
            
            # Update session event count if session_id provided
            if session_id:
                try:
                    session = UserSession.objects.get(session_id=session_id)
                    session.events_count += 1
                    session.save(update_fields=['events_count'])
                except UserSession.DoesNotExist:
                    pass
            
            # Update engagement metrics
            AnalyticsService.update_user_engagement_metrics(user)
            
            return event
            
        except Exception as e:
            logger.error(f"Error tracking event {event_type} for user {user.id}: {str(e)}")
            return None
    
    @staticmethod
    def start_session(user, ip_address=None, user_agent=None):
        """Start a new user session"""
        try:
            session_id = str(uuid.uuid4())
            device_type = AnalyticsService.detect_device_type(user_agent)
            
            session = UserSession.objects.create(
                user=user,
                session_id=session_id,
                ip_address=ip_address,
                user_agent=user_agent or '',
                device_type=device_type
            )
            
            # Track session start event
            AnalyticsService.track_event(
                user=user,
                event_type='user_login',
                session_id=session_id,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            return session
            
        except Exception as e:
            logger.error(f"Error starting session for user {user.id}: {str(e)}")
            return None
    
    @staticmethod
    def end_session(session_id):
        """End a user session"""
        try:
            session = UserSession.objects.get(session_id=session_id)
            session.end_time = timezone.now()
            session.calculate_duration()
            
            # Track session end event
            AnalyticsService.track_event(
                user=session.user,
                event_type='user_logout',
                session_id=session_id,
                event_data={'duration_seconds': session.duration_seconds}
            )
            
            return session
            
        except UserSession.DoesNotExist:
            logger.warning(f"Session {session_id} not found for ending")
            return None
        except Exception as e:
            logger.error(f"Error ending session {session_id}: {str(e)}")
            return None
    
    @staticmethod
    def track_page_view(user, page_path, session_id=None, referrer=None):
        """Track a page view"""
        AnalyticsService.track_event(
            user=user,
            event_type='page_view',
            event_data={'page_path': page_path},
            session_id=session_id,
            referrer=referrer
        )
        
        # Update session page views
        if session_id:
            try:
                session = UserSession.objects.get(session_id=session_id)
                session.page_views += 1
                session.save(update_fields=['page_views'])
            except UserSession.DoesNotExist:
                pass
    
    @staticmethod
    def track_feature_usage(user, feature, time_spent_seconds=0):
        """Track feature usage and update metrics"""
        try:
            feature_usage, created = FeatureUsage.objects.get_or_create(
                user=user,
                feature=feature,
                defaults={'first_used': timezone.now()}
            )
            
            if not created:
                feature_usage.last_used = timezone.now()
                feature_usage.usage_count += 1
                feature_usage.total_time_seconds += time_spent_seconds
                feature_usage.save()
            
            # Track feature usage event
            AnalyticsService.track_event(
                user=user,
                event_type='feature_used',
                event_data={
                    'feature': feature,
                    'usage_count': feature_usage.usage_count,
                    'time_spent_seconds': time_spent_seconds
                }
            )
            
            return feature_usage
            
        except Exception as e:
            logger.error(f"Error tracking feature usage {feature} for user {user.id}: {str(e)}")
            return None
    
    @staticmethod
    def update_user_engagement_metrics(user):
        """Update or create user engagement metrics"""
        try:
            metrics, created = UserEngagementMetrics.objects.get_or_create(
                user=user,
                defaults={
                    'registration_date': user.created_at,
                    'last_active_date': timezone.now()
                }
            )
            
            if not created:
                metrics.last_active_date = timezone.now()
            
            # Calculate various metrics
            now = timezone.now()
            
            # Session metrics
            sessions = UserSession.objects.filter(user=user)
            metrics.total_sessions = sessions.count()
            metrics.total_session_time_seconds = sessions.aggregate(
                total=models.Sum('duration_seconds')
            )['total'] or 0
            
            # Activity days
            unique_days = UserEvent.objects.filter(user=user).dates('timestamp', 'day')
            metrics.days_active = unique_days.count()
            
            # Habit metrics from events
            habit_events = UserEvent.objects.filter(user=user, event_type__startswith='habit_')
            metrics.habits_created = habit_events.filter(event_type='habit_created').count()
            metrics.habits_completed = habit_events.filter(event_type='habit_completed').count()
            
            # Current active habits
            from habits.models import Habit
            metrics.current_active_habits = Habit.objects.filter(
                user=user, is_active=True
            ).count()
            
            # Streak metrics
            if metrics.current_active_habits > 0:
                habits = Habit.objects.filter(user=user, is_active=True)
                streaks = [habit.get_current_streak() for habit in habits]
                longest_streak = max([habit.get_streak_stats()['longest_streak'] for habit in habits], default=0)
                metrics.longest_streak = longest_streak
                metrics.total_streak_days = sum(streaks)
            
            # Feature adoption
            feature_count = FeatureUsage.objects.filter(user=user).count()
            metrics.features_discovered = feature_count
            
            # Recently used features (last 7 days)
            recent_features = FeatureUsage.objects.filter(
                user=user,
                last_used__gte=now - timedelta(days=7)
            ).count()
            metrics.features_actively_used = recent_features
            
            # Milestones and badges
            milestone_events = UserEvent.objects.filter(
                user=user, event_type='streak_milestone'
            ).count()
            metrics.milestones_reached = milestone_events
            
            badge_events = UserEvent.objects.filter(
                user=user, event_type='badge_earned'
            ).count()
            metrics.badges_earned = badge_events
            
            report_events = UserEvent.objects.filter(
                user=user, event_type='report_generated'
            ).count()
            metrics.reports_generated = report_events
            
            # Insurance usage
            insurance_events = UserEvent.objects.filter(
                user=user, event_type='insurance_used'
            ).count()
            metrics.insurance_used = insurance_events
            
            # Comeback count
            comeback_events = UserEvent.objects.filter(
                user=user, event_type='comeback_detected'
            ).count()
            metrics.comebacks_count = comeback_events
            
            # Calculate engagement scores
            metrics.calculate_scores()
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error updating engagement metrics for user {user.id}: {str(e)}")
            return None
    
    @staticmethod
    def detect_device_type(user_agent):
        """Detect device type from user agent"""
        if not user_agent:
            return 'unknown'
            
        user_agent = user_agent.lower()
        
        if 'mobile' in user_agent or 'android' in user_agent or 'iphone' in user_agent:
            return 'mobile'
        elif 'tablet' in user_agent or 'ipad' in user_agent:
            return 'tablet'
        else:
            return 'desktop'
    
    @staticmethod
    def calculate_retention_cohorts():
        """Calculate retention cohort analysis"""
        try:
            today = timezone.now().date()
            
            # Daily cohorts for the last 30 days
            for days_ago in range(30):
                cohort_date = today - timedelta(days=days_ago)
                
                # Get users who registered on this date
                cohort_users = User.objects.filter(created_at__date=cohort_date)
                total_users = cohort_users.count()
                
                if total_users == 0:
                    continue
                
                # Calculate retention for different periods
                for period in [1, 3, 7, 14, 30]:
                    if days_ago < period:  # Can't calculate future retention
                        continue
                        
                    target_date = cohort_date + timedelta(days=period)
                    
                    # Count how many were active on target date
                    active_users = UserEvent.objects.filter(
                        user__in=cohort_users,
                        timestamp__date=target_date
                    ).values('user').distinct().count()
                    
                    retention_rate = (active_users / total_users * 100) if total_users > 0 else 0
                    
                    RetentionCohort.objects.update_or_create(
                        cohort_type='daily',
                        cohort_date=cohort_date,
                        period=period,
                        defaults={
                            'total_users': total_users,
                            'active_users': active_users,
                            'retention_rate': retention_rate
                        }
                    )
            
            logger.info("Retention cohort analysis completed")
            
        except Exception as e:
            logger.error(f"Error calculating retention cohorts: {str(e)}")
    
    @staticmethod
    def get_user_analytics_summary(user):
        """Get comprehensive analytics summary for a user"""
        try:
            metrics = UserEngagementMetrics.objects.get(user=user)
            
            # Recent activity (last 7 days)
            recent_events = UserEvent.objects.filter(
                user=user,
                timestamp__gte=timezone.now() - timedelta(days=7)
            )
            
            # Feature usage
            features = FeatureUsage.objects.filter(user=user).order_by('-usage_count')
            
            summary = {
                'engagement_metrics': {
                    'activity_score': metrics.activity_score,
                    'habit_consistency_score': metrics.habit_consistency_score,
                    'feature_adoption_score': metrics.feature_adoption_score,
                    'retention_risk_score': metrics.retention_risk_score,
                },
                'activity_stats': {
                    'days_since_registration': metrics.days_since_registration,
                    'days_active': metrics.days_active,
                    'total_sessions': metrics.total_sessions,
                    'total_session_hours': round(metrics.total_session_time_seconds / 3600, 1),
                },
                'habit_stats': {
                    'habits_created': metrics.habits_created,
                    'habits_completed': metrics.habits_completed,
                    'current_active_habits': metrics.current_active_habits,
                    'longest_streak': metrics.longest_streak,
                    'total_streak_days': metrics.total_streak_days,
                },
                'feature_adoption': {
                    'features_discovered': metrics.features_discovered,
                    'features_actively_used': metrics.features_actively_used,
                    'top_features': [
                        {
                            'feature': f.feature,
                            'usage_count': f.usage_count,
                            'total_hours': round(f.total_time_seconds / 3600, 1)
                        } for f in features[:5]
                    ]
                },
                'recent_activity': {
                    'events_last_7_days': recent_events.count(),
                    'event_breakdown': dict(
                        recent_events.values('event_type').annotate(
                            count=models.Count('id')
                        ).values_list('event_type', 'count')
                    )
                }
            }
            
            return summary
            
        except UserEngagementMetrics.DoesNotExist:
            return None
        except Exception as e:
            logger.error(f"Error getting analytics summary for user {user.id}: {str(e)}")
            return None