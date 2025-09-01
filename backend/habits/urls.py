from django.urls import path
from . import views

urlpatterns = [
    path('mission/', views.MissionView.as_view(), name='mission'),
    path('vision/', views.VisionView.as_view(), name='vision'),
    path('habits/', views.HabitListCreateView.as_view(), name='habits'),
    path('habits/<uuid:pk>/', views.HabitDetailView.as_view(), name='habit-detail'),
    path('habits/<uuid:pk>/checkins/', views.CheckinCreateView.as_view(), name='habit-checkin'),
    path('mood/', views.MoodCreateView.as_view(), name='mood-create'),
    path('mood/history/', views.MoodHistoryView.as_view(), name='mood-history'),
    path('triggers/', views.TriggerListCreateView.as_view(), name='triggers'),
    path('env-pledge/', views.EnvPledgeView.as_view(), name='env-pledge'),
    path('plans/if-then/', views.PlanIfThenListCreateView.as_view(), name='if-then-plans'),
]