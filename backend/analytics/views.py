from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import models
from django.contrib.auth import get_user_model
from datetime import timedelta
from .models import UserEvent, UserSession, FeatureUsage, UserEngagementMetrics, RetentionCohort
from .serializers import (
    UserEventSerializer, UserSessionSerializer, FeatureUsageSerializer,
    UserEngagementMetricsSerializer, EventTrackingSerializer,
    AnalyticsSummarySerializer, AnalyticsDashboardSerializer
)
from .services import AnalyticsService

User = get_user_model()


class TrackEventView(APIView):
    """API endpoint to track user events"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = EventTrackingSerializer(data=request.data)
        if serializer.is_valid():
            # Get client information
            ip_address = request.META.get('HTTP_X_FORWARDED_FOR', 
                                        request.META.get('REMOTE_ADDR'))
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            referrer = request.META.get('HTTP_REFERER', '')
            
            event = AnalyticsService.track_event(
                user=request.user,
                event_type=serializer.validated_data['event_type'],
                event_data=serializer.validated_data.get('event_data', {}),
                session_id=serializer.validated_data.get('session_id'),
                ip_address=ip_address,
                user_agent=user_agent,
                referrer=referrer
            )
            
            if event:
                # Track page view if page_path provided
                page_path = serializer.validated_data.get('page_path')
                if page_path:
                    AnalyticsService.track_page_view(
                        user=request.user,
                        page_path=page_path,
                        session_id=serializer.validated_data.get('session_id'),
                        referrer=referrer
                    )
                
                return Response({'status': 'success', 'event_id': str(event.id)})
            else:
                return Response(
                    {'error': 'Failed to track event'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StartSessionView(APIView):
    """API endpoint to start a user session"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        ip_address = request.META.get('HTTP_X_FORWARDED_FOR', 
                                    request.META.get('REMOTE_ADDR'))
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        session = AnalyticsService.start_session(
            user=request.user,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        if session:
            return Response({
                'session_id': session.session_id,
                'device_type': session.device_type
            })
        else:
            return Response(
                {'error': 'Failed to start session'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class EndSessionView(APIView):
    """API endpoint to end a user session"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        session_id = request.data.get('session_id')
        if not session_id:
            return Response(
                {'error': 'session_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session = AnalyticsService.end_session(session_id)
        if session:
            return Response({
                'session_id': session.session_id,
                'duration_seconds': session.duration_seconds
            })
        else:
            return Response(
                {'error': 'Session not found or failed to end'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class FeatureUsageView(APIView):
    """API endpoint to track feature usage"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        feature = request.data.get('feature')
        time_spent_seconds = request.data.get('time_spent_seconds', 0)
        
        if not feature:
            return Response(
                {'error': 'feature is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate feature name
        valid_features = [choice[0] for choice in FeatureUsage.FEATURES]
        if feature not in valid_features:
            return Response(
                {'error': f'Invalid feature. Must be one of: {valid_features}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        feature_usage = AnalyticsService.track_feature_usage(
            user=request.user,
            feature=feature,
            time_spent_seconds=int(time_spent_seconds)
        )
        
        if feature_usage:
            serializer = FeatureUsageSerializer(feature_usage)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Failed to track feature usage'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get(self, request):
        """Get user's feature usage statistics"""
        features = FeatureUsage.objects.filter(user=request.user).order_by('-usage_count')
        serializer = FeatureUsageSerializer(features, many=True)
        return Response(serializer.data)


class UserAnalyticsSummaryView(APIView):
    """API endpoint to get user's analytics summary"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        summary = AnalyticsService.get_user_analytics_summary(request.user)
        if summary:
            serializer = AnalyticsSummarySerializer(summary)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Analytics data not available'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class UserEngagementMetricsView(APIView):
    """API endpoint to get user engagement metrics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            metrics = UserEngagementMetrics.objects.get(user=request.user)
            serializer = UserEngagementMetricsSerializer(metrics)
            return Response(serializer.data)
        except UserEngagementMetrics.DoesNotExist:
            # Create metrics if they don't exist
            metrics = AnalyticsService.update_user_engagement_metrics(request.user)
            if metrics:
                serializer = UserEngagementMetricsSerializer(metrics)
                return Response(serializer.data)
            else:
                return Response(
                    {'error': 'Failed to create engagement metrics'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )


class AdminAnalyticsDashboardView(APIView):
    """Admin dashboard with comprehensive analytics"""
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        now = timezone.now()
        today = now.date()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        # Basic user metrics
        total_users = User.objects.count()
        new_registrations_today = User.objects.filter(created_at__date=today).count()
        new_registrations_week = User.objects.filter(created_at__gte=week_ago).count()
        new_registrations_month = User.objects.filter(created_at__gte=month_ago).count()
        
        # Active users (users with events in the time period)
        active_users_today = UserEvent.objects.filter(
            timestamp__date=today
        ).values('user').distinct().count()
        
        active_users_week = UserEvent.objects.filter(
            timestamp__gte=week_ago
        ).values('user').distinct().count()
        
        active_users_month = UserEvent.objects.filter(
            timestamp__gte=month_ago
        ).values('user').distinct().count()
        
        # Session metrics
        avg_session_duration = UserSession.objects.filter(
            duration_seconds__isnull=False
        ).aggregate(
            avg=models.Avg('duration_seconds')
        )['avg'] or 0
        
        # Engagement metrics
        avg_engagement_score = UserEngagementMetrics.objects.aggregate(
            avg=models.Avg('activity_score')
        )['avg'] or 0
        
        # Top features by usage
        top_features = list(
            FeatureUsage.objects.values('feature').annotate(
                total_usage=models.Sum('usage_count'),
                unique_users=models.Count('user', distinct=True)
            ).order_by('-total_usage')[:10]
        )
        
        # Event counts by type (last 7 days)
        event_counts = dict(
            UserEvent.objects.filter(
                timestamp__gte=week_ago
            ).values('event_type').annotate(
                count=models.Count('id')
            ).values_list('event_type', 'count')
        )
        
        # Retention rates
        retention_rates = {}
        recent_cohorts = RetentionCohort.objects.filter(
            cohort_type='daily',
            cohort_date__gte=today - timedelta(days=30)
        )
        
        if recent_cohorts.exists():
            retention_by_period = recent_cohorts.values('period').annotate(
                avg_retention=models.Avg('retention_rate')
            ).order_by('period')
            
            retention_rates = {
                f"day_{item['period']}": round(item['avg_retention'], 2)
                for item in retention_by_period
            }
        
        dashboard_data = {
            'total_users': total_users,
            'active_users_today': active_users_today,
            'active_users_week': active_users_week,
            'active_users_month': active_users_month,
            'new_registrations_today': new_registrations_today,
            'new_registrations_week': new_registrations_week,
            'new_registrations_month': new_registrations_month,
            'avg_session_duration': round(avg_session_duration, 2),
            'avg_engagement_score': round(avg_engagement_score, 2),
            'top_features': top_features,
            'retention_rates': retention_rates,
            'event_counts': event_counts,
        }
        
        serializer = AnalyticsDashboardSerializer(dashboard_data)
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def calculate_retention_cohorts(request):
    """Admin endpoint to trigger retention cohort calculation"""
    try:
        AnalyticsService.calculate_retention_cohorts()
        return Response({'status': 'success', 'message': 'Retention cohorts calculated'})
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAdminUser])
def update_all_engagement_metrics(request):
    """Admin endpoint to update engagement metrics for all users"""
    try:
        users = User.objects.all()
        updated_count = 0
        
        for user in users:
            metrics = AnalyticsService.update_user_engagement_metrics(user)
            if metrics:
                updated_count += 1
        
        return Response({
            'status': 'success', 
            'message': f'Updated engagement metrics for {updated_count} users'
        })
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )