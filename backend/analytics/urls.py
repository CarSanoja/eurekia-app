from django.urls import path
from . import views

urlpatterns = [
    # Event tracking
    path('track/', views.TrackEventView.as_view(), name='track-event'),
    
    # Session management
    path('session/start/', views.StartSessionView.as_view(), name='start-session'),
    path('session/end/', views.EndSessionView.as_view(), name='end-session'),
    
    # Feature usage
    path('features/', views.FeatureUsageView.as_view(), name='feature-usage'),
    
    # User analytics
    path('user/summary/', views.UserAnalyticsSummaryView.as_view(), name='user-analytics-summary'),
    path('user/engagement/', views.UserEngagementMetricsView.as_view(), name='user-engagement-metrics'),
    
    # Admin analytics
    path('admin/dashboard/', views.AdminAnalyticsDashboardView.as_view(), name='admin-analytics-dashboard'),
    path('admin/calculate-retention/', views.calculate_retention_cohorts, name='calculate-retention-cohorts'),
    path('admin/update-metrics/', views.update_all_engagement_metrics, name='update-engagement-metrics'),
]