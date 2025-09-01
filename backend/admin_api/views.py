from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Count, Avg, Q, Sum
from datetime import timedelta, datetime
from collections import defaultdict

from accounts.models import User, ContactMethod, ChannelPreference
from habits.models import Habit, Checkin, Mood, Mission, Vision, Badge
from ai_services.langgraph_service import langgraph_ai_service
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_dashboard_stats(request):
    """Get comprehensive dashboard statistics for admin"""
    try:
        # Only allow admin users (you can implement proper admin checking)
        if not request.user.is_staff and not request.user.email.endswith('@eurekia.com'):
            return Response(
                {'error': 'Unauthorized'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Date ranges for analysis
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # User Statistics
        total_users = User.objects.count()
        active_users_week = User.objects.filter(last_login__gte=week_ago).count()
        new_users_week = User.objects.filter(date_joined__gte=week_ago).count()
        
        # Habit Statistics
        total_habits = Habit.objects.filter(is_active=True).count()
        habits_per_user = total_habits / total_users if total_users > 0 else 0
        
        # Checkin Statistics
        total_checkins = Checkin.objects.count()
        checkins_this_week = Checkin.objects.filter(date__gte=week_ago).count()
        completed_checkins = Checkin.objects.filter(value=True).count()
        overall_completion_rate = (completed_checkins / total_checkins * 100) if total_checkins > 0 else 0
        
        # AI Usage (from LangGraph service usage)
        # TODO: Implement proper AI usage tracking
        estimated_ai_requests = total_checkins // 10  # Rough estimate
        
        # User Engagement
        users_with_habits = User.objects.filter(habits__isnull=False).distinct().count()
        users_with_checkins = User.objects.filter(habits__checkins__isnull=False).distinct().count()
        engagement_rate = (users_with_checkins / total_users * 100) if total_users > 0 else 0
        
        # System Health
        system_health = {
            'database_status': 'healthy',
            'ai_service_status': 'healthy' if langgraph_ai_service.ai_available else 'degraded',
            'last_updated': timezone.now().isoformat()
        }
        
        stats = {
            'user_stats': {
                'total_users': total_users,
                'active_users_week': active_users_week,
                'new_users_week': new_users_week,
                'engagement_rate': round(engagement_rate, 1)
            },
            'habit_stats': {
                'total_habits': total_habits,
                'habits_per_user': round(habits_per_user, 1),
                'users_with_habits': users_with_habits
            },
            'checkin_stats': {
                'total_checkins': total_checkins,
                'checkins_this_week': checkins_this_week,
                'completion_rate': round(overall_completion_rate, 1),
                'users_with_checkins': users_with_checkins
            },
            'ai_stats': {
                'estimated_requests': estimated_ai_requests,
                'service_available': langgraph_ai_service.ai_available
            },
            'system_health': system_health,
            'generated_at': timezone.now().isoformat()
        }
        
        return Response(stats)
        
    except Exception as e:
        logger.error(f"Error generating admin dashboard stats: {str(e)}")
        return Response(
            {'error': 'Unable to generate dashboard statistics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_analytics(request):
    """Get detailed user analytics for admin dashboard"""
    try:
        # Only allow admin users
        if not request.user.is_staff and not request.user.email.endswith('@eurekia.com'):
            return Response(
                {'error': 'Unauthorized'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days-1)
        
        # User registration trends
        registration_data = []
        current_date = start_date
        while current_date <= end_date:
            count = User.objects.filter(
                date_joined__date=current_date
            ).count()
            registration_data.append({
                'date': current_date.isoformat(),
                'registrations': count
            })
            current_date += timedelta(days=1)
        
        # User activity analysis
        active_users = User.objects.filter(
            last_login__gte=start_date
        ).count()
        
        # Users by class code
        class_distribution = list(
            User.objects.values('class_code')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        # Users with contact methods
        users_with_contact = ContactMethod.objects.values('user').distinct().count()
        contact_method_types = list(
            ContactMethod.objects.values('contact_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        
        analytics = {
            'registration_trends': registration_data,
            'activity_summary': {
                'total_users': User.objects.count(),
                'active_users': active_users,
                'users_with_contact': users_with_contact
            },
            'class_distribution': class_distribution,
            'contact_methods': contact_method_types,
            'time_period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            }
        }
        
        return Response(analytics)
        
    except Exception as e:
        logger.error(f"Error generating user analytics: {str(e)}")
        return Response(
            {'error': 'Unable to generate user analytics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def habit_analytics(request):
    """Get detailed habit analytics for admin dashboard"""
    try:
        # Only allow admin users
        if not request.user.is_staff and not request.user.email.endswith('@eurekia.com'):
            return Response(
                {'error': 'Unauthorized'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days-1)
        
        # Habit creation trends
        habit_creation_data = []
        current_date = start_date
        while current_date <= end_date:
            count = Habit.objects.filter(
                created_at__date=current_date
            ).count()
            habit_creation_data.append({
                'date': current_date.isoformat(),
                'habits_created': count
            })
            current_date += timedelta(days=1)
        
        # Difficulty level distribution
        difficulty_distribution = list(
            Habit.objects.filter(is_active=True)
            .values('difficulty_level')
            .annotate(count=Count('id'))
            .order_by('difficulty_level')
        )
        
        # Habit completion rates by difficulty
        completion_by_difficulty = []
        for level in [1, 2, 3]:
            habits = Habit.objects.filter(difficulty_level=level, is_active=True)
            total_checkins = Checkin.objects.filter(
                habit__difficulty_level=level,
                date__gte=start_date
            ).count()
            completed_checkins = Checkin.objects.filter(
                habit__difficulty_level=level,
                date__gte=start_date,
                value=True
            ).count()
            
            completion_rate = (completed_checkins / total_checkins * 100) if total_checkins > 0 else 0
            
            completion_by_difficulty.append({
                'difficulty_level': level,
                'difficulty_name': ['Easy', 'Medium', 'Hard'][level-1],
                'total_habits': habits.count(),
                'completion_rate': round(completion_rate, 1)
            })
        
        # Most popular habit types (analyze titles for common patterns)
        habit_titles = list(
            Habit.objects.filter(is_active=True)
            .values('title')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        
        # Daily checkin trends
        checkin_trends = []
        current_date = start_date
        while current_date <= end_date:
            total_checkins = Checkin.objects.filter(date=current_date).count()
            completed_checkins = Checkin.objects.filter(
                date=current_date, 
                value=True
            ).count()
            completion_rate = (completed_checkins / total_checkins * 100) if total_checkins > 0 else 0
            
            checkin_trends.append({
                'date': current_date.isoformat(),
                'total_checkins': total_checkins,
                'completed_checkins': completed_checkins,
                'completion_rate': round(completion_rate, 1)
            })
            current_date += timedelta(days=1)
        
        analytics = {
            'habit_creation_trends': habit_creation_data,
            'difficulty_distribution': difficulty_distribution,
            'completion_by_difficulty': completion_by_difficulty,
            'popular_habits': habit_titles,
            'checkin_trends': checkin_trends,
            'summary': {
                'total_active_habits': Habit.objects.filter(is_active=True).count(),
                'total_checkins_period': sum(item['total_checkins'] for item in checkin_trends),
                'average_completion_rate': round(
                    sum(item['completion_rate'] for item in checkin_trends) / len(checkin_trends), 1
                ) if checkin_trends else 0
            },
            'time_period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            }
        }
        
        return Response(analytics)
        
    except Exception as e:
        logger.error(f"Error generating habit analytics: {str(e)}")
        return Response(
            {'error': 'Unable to generate habit analytics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_usage_analytics(request):
    """Get AI usage analytics for admin dashboard"""
    try:
        # Only allow admin users
        if not request.user.is_staff and not request.user.email.endswith('@eurekia.com'):
            return Response(
                {'error': 'Unauthorized'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        days = int(request.query_params.get('days', 30))
        
        # Since we don't have detailed AI usage tracking yet, provide estimated analytics
        # TODO: Implement proper AI usage tracking with database storage
        
        total_users = User.objects.count()
        active_users = User.objects.filter(
            last_login__gte=timezone.now() - timedelta(days=days)
        ).count()
        
        # Estimate AI usage based on user activity
        estimated_daily_requests = max(1, active_users * 2)  # Assume 2 AI requests per active user per day
        estimated_total_requests = estimated_daily_requests * days
        
        # Mock usage trends (replace with real data when tracking is implemented)
        usage_trends = []
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days-1)
        
        current_date = start_date
        while current_date <= end_date:
            # Simulate usage patterns (higher on weekdays, lower on weekends)
            base_usage = estimated_daily_requests
            if current_date.weekday() >= 5:  # Weekend
                daily_usage = int(base_usage * 0.6)
            else:  # Weekday
                daily_usage = base_usage
                
            usage_trends.append({
                'date': current_date.isoformat(),
                'requests': daily_usage,
                'unique_users': min(daily_usage, active_users)
            })
            current_date += timedelta(days=1)
        
        # Service health metrics
        service_metrics = {
            'langgraph_available': langgraph_ai_service.ai_available,
            'gemini_model': 'gemini-1.5-flash-002',
            'embeddings_model': 'text-embedding-004',
            'estimated_cost_per_request': 0.001,  # Estimated cost in USD
            'estimated_total_cost': estimated_total_requests * 0.001
        }
        
        # Feature usage breakdown (estimated)
        feature_usage = {
            'progress_reports': int(estimated_total_requests * 0.4),
            'habit_insights': int(estimated_total_requests * 0.3),
            'embeddings_generation': int(estimated_total_requests * 0.2),
            'motivational_messages': int(estimated_total_requests * 0.1)
        }
        
        analytics = {
            'usage_trends': usage_trends,
            'service_metrics': service_metrics,
            'feature_usage': feature_usage,
            'summary': {
                'total_estimated_requests': estimated_total_requests,
                'daily_average': round(estimated_total_requests / days, 1),
                'active_ai_users': active_users,
                'requests_per_user': round(estimated_total_requests / active_users, 1) if active_users > 0 else 0
            },
            'time_period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'days': days
            },
            'note': 'AI usage data is currently estimated. Implement detailed tracking for accurate metrics.'
        }
        
        return Response(analytics)
        
    except Exception as e:
        logger.error(f"Error generating AI usage analytics: {str(e)}")
        return Response(
            {'error': 'Unable to generate AI usage analytics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_health(request):
    """Get comprehensive system health status"""
    try:
        # Only allow admin users
        if not request.user.is_staff and not request.user.email.endswith('@eurekia.com'):
            return Response(
                {'error': 'Unauthorized'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Database connectivity test
        try:
            User.objects.count()
            database_status = 'healthy'
        except Exception as e:
            database_status = f'error: {str(e)}'
        
        # AI Service status
        ai_service_status = {
            'langgraph_available': langgraph_ai_service.ai_available,
            'status': 'healthy' if langgraph_ai_service.ai_available else 'degraded'
        }
        
        # Recent activity indicators
        recent_activity = {
            'users_last_hour': User.objects.filter(
                last_login__gte=timezone.now() - timedelta(hours=1)
            ).count(),
            'checkins_today': Checkin.objects.filter(
                date=timezone.now().date()
            ).count(),
            'habits_created_today': Habit.objects.filter(
                created_at__date=timezone.now().date()
            ).count()
        }
        
        # System resources (simplified)
        system_resources = {
            'total_users': User.objects.count(),
            'total_habits': Habit.objects.count(),
            'total_checkins': Checkin.objects.count(),
            'database_size_estimate': 'N/A'  # Would require database-specific queries
        }
        
        health_report = {
            'overall_status': 'healthy' if database_status == 'healthy' and ai_service_status['status'] == 'healthy' else 'degraded',
            'components': {
                'database': database_status,
                'ai_service': ai_service_status,
                'web_server': 'healthy'  # If we can respond, it's healthy
            },
            'recent_activity': recent_activity,
            'system_resources': system_resources,
            'last_checked': timezone.now().isoformat()
        }
        
        return Response(health_report)
        
    except Exception as e:
        logger.error(f"Error generating system health report: {str(e)}")
        return Response(
            {'error': 'Unable to generate system health report'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )