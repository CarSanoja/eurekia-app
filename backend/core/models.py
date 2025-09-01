from django.db import models
from django.conf import settings
import uuid


class Course(models.Model):
    VISIBILITY_CHOICES = [
        ('draft', 'Draft'),
        ('live', 'Live'),
        ('archived', 'Archived'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='draft')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='courses_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.code})"


class Enrollment(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('coach', 'Coach'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'enrollments'
        unique_together = ['user', 'course']
        indexes = [
            models.Index(fields=['user', 'course']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.course.title} ({self.role})"


class Resource(models.Model):
    TYPE_CHOICES = [
        ('doc', 'Document'),
        ('link', 'Link'),
        ('video', 'Video'),
        ('pdf', 'PDF'),
    ]
    
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('enrolled', 'Enrolled Only'),
        ('coaches', 'Coaches Only'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    url = models.URLField(max_length=500)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='enrolled')
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resources'
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.course.code} - {self.title}"


class AccessRule(models.Model):
    AUDIENCE_CHOICES = [
        ('enrolled', 'Enrolled Users'),
        ('coaches', 'Coaches Only'),
        ('public', 'Public'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='access_rules')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='access_rules')
    audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'access_rules'
        unique_together = ['course', 'resource', 'audience']
    
    def __str__(self):
        return f"{self.resource.title} - {self.audience}"
