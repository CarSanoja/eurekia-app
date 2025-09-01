from django.urls import path
from . import views

urlpatterns = [
    path('courses/', views.CourseListView.as_view(), name='courses'),
    path('courses/<uuid:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
]