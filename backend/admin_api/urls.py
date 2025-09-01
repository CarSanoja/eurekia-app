from django.urls import path
from . import views

urlpatterns = [
    path('admin/dashboard/stats/', views.admin_dashboard_stats, name='admin-dashboard-stats'),
    path('admin/analytics/users/', views.user_analytics, name='admin-user-analytics'),
    path('admin/analytics/habits/', views.habit_analytics, name='admin-habit-analytics'),
    path('admin/analytics/ai/', views.ai_usage_analytics, name='admin-ai-analytics'),
    path('admin/system/health/', views.system_health, name='admin-system-health'),
]