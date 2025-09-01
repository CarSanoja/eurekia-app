from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
import csv
import json

from accounts.models import User
from core.models import Course, Enrollment
from habits.models import Habit, Checkin
from accounts.serializers import UserSerializer
from core.serializers import CourseSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    """Get overall admin dashboard statistics"""
    
    # Basic counts
    total_users = User.objects.filter(is_active=True).count()
    total_courses = Course.objects.count()
    total_enrollments = Enrollment.objects.count()
    
    # Recent activity (last 7 days)
    week_ago = timezone.now() - timedelta(days=7)
    new_users_week = User.objects.filter(date_joined__gte=week_ago).count()
    
    # AI usage simulation (would be real data in production)
    ai_usage_today = 156  # Simulated
    
    return Response({
        'total_users': total_users,
        'total_courses': total_courses,
        'total_enrollments': total_enrollments,
        'new_users_week': new_users_week,
        'ai_usage_today': ai_usage_today,
        'updated_at': timezone.now().isoformat()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_users_list(request):
    """Get list of users with stats for admin management"""
    
    users = User.objects.filter(is_active=True).select_related()
    
    user_data = []
    for user in users:
        habits_count = Habit.objects.filter(user=user, is_active=True).count()
        checkins_count = Checkin.objects.filter(habit__user=user).count()
        
        user_data.append({
            'id': str(user.id),
            'email': user.email,
            'name': user.name,
            'avatar_icon': user.avatar_icon,
            'avatar_color': user.avatar_color,
            'is_active': user.is_active,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'class_code': user.class_code,
            'habits_count': habits_count,
            'checkins_count': checkins_count
        })
    
    return Response(user_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_users_csv(request):
    """Export users data as CSV"""
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="quanta-users-{timezone.now().strftime("%Y-%m-%d")}.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Name', 'Email', 'Class Code', 'Active', 'Joined', 'Last Login', 'Habits', 'Check-ins'])
    
    users = User.objects.filter(is_active=True).select_related()
    
    for user in users:
        habits_count = Habit.objects.filter(user=user, is_active=True).count()
        checkins_count = Checkin.objects.filter(habit__user=user).count()
        
        writer.writerow([
            user.name,
            user.email,
            user.class_code or '',
            'Yes' if user.is_active else 'No',
            user.date_joined.strftime('%Y-%m-%d'),
            user.last_login.strftime('%Y-%m-%d') if user.last_login else 'Never',
            habits_count,
            checkins_count
        ])
    
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_courses_list(request):
    """Get list of courses for admin management"""
    
    courses = Course.objects.all().annotate(
        enrollment_count=Count('enrollment')
    ).order_by('-created_at')
    
    course_data = []
    for course in courses:
        course_data.append({
            'id': str(course.id),
            'title': course.title,
            'description': course.description,
            'code': course.code,
            'visibility': course.visibility,
            'enrollment_count': course.enrollment_count,
            'created_at': course.created_at.isoformat(),
            'updated_at': course.updated_at.isoformat()
        })
    
    return Response(course_data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_course(request):
    """Create a new course"""
    
    serializer = CourseSerializer(data=request.data)
    if serializer.is_valid():
        course = serializer.save()
        return Response({
            'id': str(course.id),
            'title': course.title,
            'description': course.description,
            'code': course.code,
            'visibility': course.visibility,
            'enrollment_count': 0,
            'created_at': course.created_at.isoformat(),
            'updated_at': course.updated_at.isoformat()
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_update_course(request, course_id):
    """Update course visibility or other fields"""
    
    try:
        course = Course.objects.get(id=course_id)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Allow partial updates
    for field in ['visibility', 'title', 'description']:
        if field in request.data:
            setattr(course, field, request.data[field])
    
    course.save()
    
    return Response({
        'id': str(course.id),
        'title': course.title,
        'description': course.description,
        'code': course.code,
        'visibility': course.visibility,
        'updated_at': course.updated_at.isoformat()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_ai_usage(request):
    """Get AI usage statistics (simulated for MVP)"""
    
    # In production, this would query actual AI usage logs
    # For now, we'll return simulated data
    
    timeframe = request.GET.get('timeframe', '7d')
    
    # Simulated usage data
    usage_data = {
        'total_requests': 1247,
        'total_tokens': 125000,
        'total_cost': 18.75,
        'requests_today': 156,
        'average_response_time': 1.2,
        'usage_by_feature': [
            {'feature': 'Progress Report', 'requests': 487, 'cost': 9.74},
            {'feature': 'Hero Infographic', 'requests': 312, 'cost': 6.24},
            {'feature': 'Habit Insights', 'requests': 248, 'cost': 1.98},
            {'feature': 'Mission Analysis', 'requests': 124, 'cost': 0.62},
            {'feature': 'Mood Analysis', 'requests': 76, 'cost': 0.17}
        ],
        'recent_requests': [
            {
                'id': '1',
                'user': 'Alice Johnson',
                'feature': 'Progress Report',
                'tokens': 1250,
                'cost': 0.025,
                'timestamp': timezone.now().isoformat(),
                'response_time': 1.1
            },
            {
                'id': '2',
                'user': 'Bob Smith',
                'feature': 'Hero Infographic',
                'tokens': 2100,
                'cost': 0.042,
                'timestamp': (timezone.now() - timedelta(minutes=5)).isoformat(),
                'response_time': 1.8
            }
        ]
    }
    
    return Response(usage_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_ai_usage_csv(request):
    """Export AI usage data as CSV"""
    
    timeframe = request.GET.get('timeframe', '7d')
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="ai-usage-{timeframe}-{timezone.now().strftime("%Y-%m-%d")}.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['User', 'Feature', 'Tokens', 'Cost (USD)', 'Response Time (s)', 'Timestamp'])
    
    # In production, this would query actual AI usage logs
    # For now, we'll use simulated data
    simulated_data = [
        ['Alice Johnson', 'Progress Report', 1250, 0.025, 1.1, timezone.now().isoformat()],
        ['Bob Smith', 'Hero Infographic', 2100, 0.042, 1.8, (timezone.now() - timedelta(minutes=5)).isoformat()],
        ['Carol Davis', 'Habit Insights', 850, 0.017, 0.9, (timezone.now() - timedelta(minutes=10)).isoformat()]
    ]
    
    for row in simulated_data:
        writer.writerow(row)
    
    return response
