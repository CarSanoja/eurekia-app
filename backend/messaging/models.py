from django.db import models
from django.conf import settings
import uuid


class OutboundMessage(models.Model):
    CHANNEL_CHOICES = [
        ('email', 'Email'),
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp'),
    ]
    
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='outbound_messages')
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    template_key = models.CharField(max_length=100)
    payload_json = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    provider_msg_id = models.CharField(max_length=255, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'outbound_messages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.channel} - {self.status}"


class InboundMessage(models.Model):
    CHANNEL_CHOICES = [
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
    ]
    
    INTENT_CHOICES = [
        ('checkin', 'Check-in'),
        ('mood', 'Mood'),
        ('help', 'Help'),
        ('unknown', 'Unknown'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='inbound_messages')
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    text = models.TextField()
    parsed_intent = models.CharField(max_length=20, choices=INTENT_CHOICES, default='unknown')
    meta_json = models.JSONField(default=dict)
    processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'inbound_messages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'channel']),
            models.Index(fields=['processed', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.channel} - {self.parsed_intent}"


class ConsentLog(models.Model):
    ACTION_CHOICES = [
        ('opt_in', 'Opt In'),
        ('opt_out', 'Opt Out'),
    ]
    
    SOURCE_CHOICES = [
        ('web', 'Web'),
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='consent_logs')
    channel = models.CharField(max_length=20)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'consent_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'channel']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.channel} - {self.action}"


class MessageTemplate(models.Model):
    CHANNEL_CHOICES = [
        ('all', 'All Channels'),
        ('email', 'Email'),
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='all')
    subject = models.CharField(max_length=255, blank=True, help_text="For email only")
    body = models.TextField()
    variables = models.JSONField(default=list, help_text="List of variable names used in template")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'message_templates'
        ordering = ['key']
    
    def __str__(self):
        return f"{self.name} ({self.key})"
