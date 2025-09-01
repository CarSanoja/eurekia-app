from django.urls import path
from . import views

urlpatterns = [
    # Admin dashboard
    path('stats/', views.admin_stats, name='admin-stats'),
    
    # User management
    path('users/', views.admin_users_list, name='admin-users-list'),
    path('users/export/', views.export_users_csv, name='admin-export-users-csv'),
    
    # Course management  
    path('courses/', views.admin_courses_list, name='admin-courses-list'),
    path('courses/create/', views.admin_create_course, name='admin-create-course'),
    path('courses/<uuid:course_id>/', views.admin_update_course, name='admin-update-course'),
    
    # AI usage analytics
    path('ai-usage/', views.admin_ai_usage, name='admin-ai-usage'),
    path('ai-usage/export/', views.export_ai_usage_csv, name='admin-export-ai-usage-csv'),
]