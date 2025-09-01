from rest_framework import serializers
from .models import Course, Enrollment, Resource, AccessRule


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'code', 'description', 'start_date', 'end_date',
            'visibility', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'role', 'enrolled_at']
        read_only_fields = ['id', 'enrolled_at']


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'type', 'url', 'visibility', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']