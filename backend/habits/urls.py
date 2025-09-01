from django.urls import path
from . import views

urlpatterns = [
    path('mission/', views.MissionView.as_view(), name='mission'),
    path('vision/', views.VisionView.as_view(), name='vision'),
    path('habits/', views.HabitListCreateView.as_view(), name='habits'),
    path('habits/<uuid:pk>/', views.HabitDetailView.as_view(), name='habit-detail'),
    path('habits/<uuid:pk>/checkins/', views.CheckinCreateView.as_view(), name='habit-checkin'),
    path('habits/<uuid:pk>/insurance/', views.HabitInsuranceView.as_view(), name='habit-insurance'),
    path('habits/<uuid:pk>/streak-stats/', views.StreakStatsView.as_view(), name='habit-streak-stats'),
    path('mood/', views.MoodCreateView.as_view(), name='mood-create'),
    path('mood/history/', views.MoodHistoryView.as_view(), name='mood-history'),
    path('triggers/', views.TriggerListCreateView.as_view(), name='triggers'),
    path('env-pledge/', views.EnvPledgeView.as_view(), name='env-pledge'),
    path('plans/if-then/', views.PlanIfThenListCreateView.as_view(), name='if-then-plans'),
    
    # Badge endpoints
    path('badges/', views.BadgeListView.as_view(), name='badges'),
    path('badges/stats/', views.BadgeStatsView.as_view(), name='badge-stats'),
    
    # Progress tracking endpoints
    path('progress/stats/', views.ProgressStatsView.as_view(), name='progress-stats'),
    path('progress/chart/', views.HabitProgressView.as_view(), name='progress-chart'),
    path('progress/calendar/', views.HabitCalendarView.as_view(), name='progress-calendar'),
]