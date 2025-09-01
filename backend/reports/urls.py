from django.urls import path
from . import views

urlpatterns = [
    path('reports/progress/', views.generate_progress_report, name='progress-report'),
    path('reports/analytics/habits/', views.habits_analytics, name='habits-analytics'),
    path('reports/analytics/mood/', views.mood_analytics, name='mood-analytics'),
    path('reports/hero/', views.HeroReportView.as_view(), name='hero-report'),
    path('habits/<uuid:habit_id>/insights/', views.AIInsightsView.as_view(), name='habit-insights'),
]