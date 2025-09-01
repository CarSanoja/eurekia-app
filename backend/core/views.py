"""
Core views for health checks and basic API endpoints
"""
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import ListAPIView, RetrieveAPIView
from .models import Course
from .serializers import CourseSerializer
import time


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint for monitoring and load balancers
    """
    health_data = {
        'status': 'healthy',
        'timestamp': time.time(),
        'version': '1.0.0',
        'environment': 'production',
    }
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            health_data['database'] = 'connected'
    except Exception as e:
        health_data['database'] = f'error: {str(e)}'
        health_data['status'] = 'unhealthy'
    
    # Check cache connection
    try:
        cache.set('health_check', 'ok', 10)
        cache_result = cache.get('health_check')
        health_data['cache'] = 'connected' if cache_result == 'ok' else 'error'
    except Exception as e:
        health_data['cache'] = f'error: {str(e)}'
        health_data['status'] = 'degraded'
    
    status_code = 200 if health_data['status'] in ['healthy', 'degraded'] else 503
    return JsonResponse(health_data, status=status_code)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_info(request):
    """
    Basic API information endpoint
    """
    return JsonResponse({
        'name': 'Eurekia Quanta API',
        'version': '1.0.0',
        'description': 'AI-powered habit tracking platform for teens',
        'documentation': '/api/docs/',
        'admin': '/admin/',
        'status': 'operational'
    })


class CourseListView(ListAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Course.objects.filter(visibility='live')


class CourseDetailView(RetrieveAPIView):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Course.objects.filter(visibility='live')