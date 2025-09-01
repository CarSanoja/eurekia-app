from celery import shared_task
from django.utils import timezone
from django.contrib.auth import get_user_model
from .services import AnalyticsService
from .models import UserEngagementMetrics
import logging

logger = logging.getLogger(__name__)
User = get_user_model()


@shared_task
def calculate_retention_cohorts():
    """Calculate retention cohort analysis - runs daily"""
    try:
        AnalyticsService.calculate_retention_cohorts()
        logger.info("Retention cohort calculation completed successfully")
        return "Retention cohorts calculated successfully"
    except Exception as e:
        logger.error(f"Failed to calculate retention cohorts: {str(e)}")
        raise


@shared_task
def update_user_engagement_metrics(user_id=None):
    """Update engagement metrics for a specific user or all users"""
    try:
        if user_id:
            # Update specific user
            try:
                user = User.objects.get(id=user_id)
                metrics = AnalyticsService.update_user_engagement_metrics(user)
                if metrics:
                    logger.info(f"Updated engagement metrics for user {user.email}")
                    return f"Updated metrics for user {user.email}"
                else:
                    logger.warning(f"Failed to update metrics for user {user.email}")
                    return f"Failed to update metrics for user {user.email}"
            except User.DoesNotExist:
                logger.error(f"User with ID {user_id} not found")
                return f"User with ID {user_id} not found"
        else:
            # Update all users
            users = User.objects.all()
            updated_count = 0
            failed_count = 0
            
            for user in users:
                try:
                    metrics = AnalyticsService.update_user_engagement_metrics(user)
                    if metrics:
                        updated_count += 1
                    else:
                        failed_count += 1
                except Exception as e:
                    logger.error(f"Failed to update metrics for user {user.email}: {str(e)}")
                    failed_count += 1
            
            logger.info(f"Updated engagement metrics: {updated_count} successful, {failed_count} failed")
            return f"Updated {updated_count} users, {failed_count} failed"
    
    except Exception as e:
        logger.error(f"Failed to update engagement metrics: {str(e)}")
        raise


@shared_task
def cleanup_old_events(days_to_keep=90):
    """Clean up old user events to keep database size manageable"""
    try:
        from .models import UserEvent, UserSession
        
        cutoff_date = timezone.now() - timezone.timedelta(days=days_to_keep)
        
        # Delete old events
        old_events = UserEvent.objects.filter(timestamp__lt=cutoff_date)
        events_count = old_events.count()
        old_events.delete()
        
        # Delete old sessions
        old_sessions = UserSession.objects.filter(start_time__lt=cutoff_date)
        sessions_count = old_sessions.count()
        old_sessions.delete()
        
        logger.info(f"Cleaned up {events_count} old events and {sessions_count} old sessions")
        return f"Cleaned up {events_count} events and {sessions_count} sessions older than {days_to_keep} days"
        
    except Exception as e:
        logger.error(f"Failed to cleanup old events: {str(e)}")
        raise


@shared_task
def identify_at_risk_users():
    """Identify users at risk of churning based on engagement metrics"""
    try:
        # Find users with high retention risk scores
        at_risk_users = UserEngagementMetrics.objects.filter(
            retention_risk_score__gte=70,  # High risk threshold
            last_active_date__lt=timezone.now() - timezone.timedelta(days=3)
        ).select_related('user')
        
        risk_data = []
        for metrics in at_risk_users:
            risk_data.append({
                'user_id': str(metrics.user.id),
                'user_email': metrics.user.email,
                'retention_risk_score': metrics.retention_risk_score,
                'days_since_active': (timezone.now() - metrics.last_active_date).days if metrics.last_active_date else None,
                'activity_score': metrics.activity_score,
                'habit_consistency_score': metrics.habit_consistency_score
            })
        
        logger.info(f"Identified {len(risk_data)} users at risk of churning")
        
        # You could integrate with messaging system here to send re-engagement emails
        # For now, just return the data
        return {
            'at_risk_count': len(risk_data),
            'users': risk_data[:10]  # Limit to first 10 for task result
        }
        
    except Exception as e:
        logger.error(f"Failed to identify at-risk users: {str(e)}")
        raise


@shared_task
def generate_analytics_summary():
    """Generate daily analytics summary for admin dashboard"""
    try:
        from django.db import models
        from .models import UserEvent, UserSession, FeatureUsage
        
        today = timezone.now().date()
        week_ago = timezone.now() - timezone.timedelta(days=7)
        
        # Daily metrics
        daily_events = UserEvent.objects.filter(timestamp__date=today).count()
        daily_active_users = UserEvent.objects.filter(
            timestamp__date=today
        ).values('user').distinct().count()
        
        # Weekly metrics
        weekly_events = UserEvent.objects.filter(timestamp__gte=week_ago).count()
        weekly_active_users = UserEvent.objects.filter(
            timestamp__gte=week_ago
        ).values('user').distinct().count()
        
        # Top events
        top_events = list(
            UserEvent.objects.filter(timestamp__gte=week_ago)
            .values('event_type')
            .annotate(count=models.Count('id'))
            .order_by('-count')[:5]
        )
        
        # Top features
        top_features = list(
            FeatureUsage.objects.filter(last_used__gte=week_ago)
            .values('feature')
            .annotate(
                usage_count=models.Sum('usage_count'),
                unique_users=models.Count('user', distinct=True)
            )
            .order_by('-usage_count')[:5]
        )
        
        # Average session duration
        avg_session_duration = UserSession.objects.filter(
            start_time__gte=week_ago,
            duration_seconds__isnull=False
        ).aggregate(avg=models.Avg('duration_seconds'))['avg'] or 0
        
        summary = {
            'date': today.isoformat(),
            'daily_events': daily_events,
            'daily_active_users': daily_active_users,
            'weekly_events': weekly_events,
            'weekly_active_users': weekly_active_users,
            'avg_session_duration_seconds': round(avg_session_duration, 2),
            'top_events': top_events,
            'top_features': top_features
        }
        
        logger.info(f"Generated analytics summary: {daily_active_users} daily active users")
        return summary
        
    except Exception as e:
        logger.error(f"Failed to generate analytics summary: {str(e)}")
        raise


@shared_task
def update_feature_adoption_scores():
    """Update feature adoption scores for all users based on recent activity"""
    try:
        from .models import FeatureUsage
        
        # Get all users with feature usage
        users_with_features = FeatureUsage.objects.values('user').distinct()
        updated_count = 0
        
        for user_data in users_with_features:
            try:
                user = User.objects.get(id=user_data['user'])
                
                # Update engagement metrics which will recalculate feature adoption score
                metrics = AnalyticsService.update_user_engagement_metrics(user)
                if metrics:
                    updated_count += 1
                    
            except User.DoesNotExist:
                continue
            except Exception as e:
                logger.error(f"Failed to update feature adoption for user {user_data['user']}: {str(e)}")
                continue
        
        logger.info(f"Updated feature adoption scores for {updated_count} users")
        return f"Updated feature adoption scores for {updated_count} users"
        
    except Exception as e:
        logger.error(f"Failed to update feature adoption scores: {str(e)}")
        raise