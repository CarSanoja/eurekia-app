from django.db import models
from django.conf import settings
import uuid


class Report(models.Model):
    REPORT_TYPES = [
        ('progress', 'Progress Report'),
        ('hero', 'Hero Infographic'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports')
    type = models.CharField(max_length=20, choices=REPORT_TYPES)
    url = models.URLField(max_length=500)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'type']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.get_type_display()} ({self.created_at.date()})"


class AIUsage(models.Model):
    FEATURE_CHOICES = [
        ('report', 'Report Generation'),
        ('insight', 'Insight'),
        ('coach_prompt', 'Coach Prompt'),
    ]
    
    MODEL_CHOICES = [
        ('gemini-1.5', 'Gemini 1.5'),
        ('gemini-flash', 'Gemini Flash'),
    ]
    
    STATUS_CHOICES = [
        ('ok', 'Success'),
        ('error', 'Error'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ai_usage')
    course = models.ForeignKey('core.Course', on_delete=models.SET_NULL, null=True, blank=True)
    feature = models.CharField(max_length=50, choices=FEATURE_CHOICES)
    model = models.CharField(max_length=50, choices=MODEL_CHOICES)
    token_in = models.IntegerField()
    token_out = models.IntegerField()
    latency_ms = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    error_message = models.TextField(blank=True)
    request_data = models.JSONField(default=dict, blank=True)
    response_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ai_usage'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at', 'user']),
            models.Index(fields=['user', 'feature']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.feature} - {self.status}"
    
    @property
    def total_tokens(self):
        return self.token_in + self.token_out
    
    @property
    def estimated_cost(self):
        # Rough estimation based on typical pricing
        # Adjust these rates based on actual pricing
        if 'flash' in self.model.lower():
            input_rate = 0.00015  # per 1k tokens
            output_rate = 0.0006  # per 1k tokens
        else:
            input_rate = 0.0005  # per 1k tokens
            output_rate = 0.0015  # per 1k tokens
        
        input_cost = (self.token_in / 1000) * input_rate
        output_cost = (self.token_out / 1000) * output_rate
        return round(input_cost + output_cost, 6)
