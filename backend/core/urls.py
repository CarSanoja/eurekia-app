from django.urls import path
from . import views

urlpatterns = [
    # Health check and API info endpoints
    path('health/', views.health_check, name='health-check'),
    path('info/', views.api_info, name='api-info'),
    
    # Course endpoints
    path('courses/', views.CourseListView.as_view(), name='courses'),
    path('courses/<uuid:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
]