from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class Mission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mission')
    skill = models.TextField(help_text="Skill or strength I want to develop")
    weakness = models.TextField(help_text="Weakness I want to overcome")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'missions'
    
    def __str__(self):
        return f"{self.user.name}'s Mission"


class Vision(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='vision')
    tags = models.JSONField(default=list, help_text="3 tags representing the vision")
    summary = models.TextField(blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'visions'
    
    def __str__(self):
        return f"{self.user.name}'s Vision"


class Habit(models.Model):
    CADENCE_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
    ]
    
    DIFFICULTY_CHOICES = [
        (1, 'Easy'),
        (2, 'Medium'),
        (3, 'Hard'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='habits')
    title = models.CharField(max_length=255)
    cadence = models.CharField(max_length=20, choices=CADENCE_CHOICES, default='daily')
    difficulty_level = models.IntegerField(choices=DIFFICULTY_CHOICES, default=1)
    anchor = models.TextField(blank=True, help_text="When/where to do this habit")
    micro_habit = models.TextField(blank=True, help_text="Smallest version of this habit")
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'habits'
        ordering = ['order', 'created_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.title}"
    
    def get_current_streak(self):
        today = timezone.now().date()
        checkins = self.checkins.filter(value=True).order_by('-date')
        
        if not checkins.exists():
            return 0
        
        streak = 0
        current_date = today
        
        for checkin in checkins:
            if checkin.date == current_date:
                streak += 1
                current_date = current_date - timezone.timedelta(days=1)
            elif checkin.date < current_date:
                break
        
        return streak


class Checkin(models.Model):
    CHANNEL_CHOICES = [
        ('web', 'Web'),
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='checkins')
    date = models.DateField()
    value = models.BooleanField(help_text="True if completed, False if skipped")
    note = models.TextField(blank=True)
    used_insurance = models.BooleanField(default=False)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='web')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'checkins'
        unique_together = ['habit', 'date']
        indexes = [
            models.Index(fields=['habit', 'date']),
            models.Index(fields=['date']),
        ]
    
    def __str__(self):
        return f"{self.habit.title} - {self.date} ({'✓' if self.value else '✗'})"


class Mood(models.Model):
    CHANNEL_CHOICES = [
        ('web', 'Web'),
        ('telegram', 'Telegram'),
        ('whatsapp', 'WhatsApp'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='moods')
    date = models.DateField()
    score = models.IntegerField(help_text="1-5 scale")
    note = models.TextField(blank=True)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default='web')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'moods'
        unique_together = ['user', 'date']
        indexes = [
            models.Index(fields=['user', 'date']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.date}: {self.score}/5"


class Trigger(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='triggers')
    text = models.TextField(help_text="What triggered you?")
    response = models.TextField(blank=True, help_text="How you responded")
    tags = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'triggers'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.name} - {self.created_at.date()}"


class EnvPledge(models.Model):
    CADENCE_CHOICES = [
        ('weekly', 'Weekly'),
        ('daily', 'Daily'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='env_pledge')
    text = models.TextField(help_text="Environmental pledge")
    cadence = models.CharField(max_length=20, choices=CADENCE_CHOICES, default='weekly')
    last_checkin_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'env_pledges'
    
    def __str__(self):
        return f"{self.user.name}'s Environmental Pledge"


class PlanIfThen(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='if_then_plans')
    situation = models.TextField(help_text="If this happens...")
    action = models.TextField(help_text="Then I will...")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'plan_if_thens'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.name} - If: {self.situation[:50]}..."


class Badge(models.Model):
    BADGE_TYPES = [
        ('foundation', 'Foundation Badge'),
        ('consistency', 'Consistency Badge'),
        ('streak_7', '7-Day Streak'),
        ('streak_30', '30-Day Streak'),
        ('comeback', 'Comeback Badge'),
        ('mission_complete', 'Mission Complete'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='badges')
    type = models.CharField(max_length=50, choices=BADGE_TYPES)
    awarded_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'badges'
        unique_together = ['user', 'type']
        ordering = ['-awarded_at']
    
    def __str__(self):
        return f"{self.user.name} - {self.get_type_display()}"
