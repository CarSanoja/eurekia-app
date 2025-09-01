from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from .models import Course
from .serializers import CourseSerializer


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