from django.urls import path
from . import views

urlpatterns = [
    path('reports/progress/', views.ProgressReportView.as_view(), name='progress-report'),
    path('reports/hero/', views.HeroReportView.as_view(), name='hero-report'),
    path('habits/<uuid:habit_id>/insights/', views.AIInsightsView.as_view(), name='habit-insights'),
]