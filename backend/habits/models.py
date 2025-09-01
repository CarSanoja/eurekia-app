from django.db import models
from django.conf import settings
from django.utils import timezone
from pgvector.django import VectorField
import uuid


class Mission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='mission')
    skill = models.TextField(help_text="Skill or strength I want to develop")
    weakness = models.TextField(help_text="Weakness I want to overcome")
    skill_embedding = VectorField(dimensions=768, null=True, blank=True)
    weakness_embedding = VectorField(dimensions=768, null=True, blank=True)
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
    title_embedding = VectorField(dimensions=768, null=True, blank=True)
    anchor_embedding = VectorField(dimensions=768, null=True, blank=True)
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
        """Calculate current streak with insurance logic"""
        today = timezone.now().date()
        checkins = self.checkins.order_by('-date')
        
        if not checkins.exists():
            return 0
        
        streak = 0
        current_date = today
        insurance_used = 0
        max_insurance = 2  # Maximum insurance days allowed per streak
        
        for checkin in checkins:
            # Check if this is the current date we're looking for
            if checkin.date == current_date:
                if checkin.value:  # Completed
                    streak += 1
                    current_date = current_date - timezone.timedelta(days=1)
                elif checkin.used_insurance and insurance_used < max_insurance:
                    # Used insurance, streak continues
                    streak += 1
                    insurance_used += 1
                    current_date = current_date - timezone.timedelta(days=1)
                else:
                    # Failed and no insurance used, streak breaks
                    break
            elif checkin.date < current_date:
                # Gap in checkins - check for grace period
                days_gap = (current_date - checkin.date).days
                if days_gap == 1 and insurance_used < max_insurance:
                    # One day grace period if we have insurance left
                    if checkin.value:
                        streak += 1
                        insurance_used += 1
                        current_date = checkin.date - timezone.timedelta(days=1)
                    else:
                        break
                else:
                    break
        
        return streak
    
    def get_streak_stats(self):
        """Get comprehensive streak statistics"""
        today = timezone.now().date()
        checkins = self.checkins.order_by('-date')
        
        current_streak = self.get_current_streak()
        longest_streak = 0
        total_completions = checkins.filter(value=True).count()
        total_checkins = checkins.count()
        
        # Calculate longest streak ever
        temp_streak = 0
        temp_max = 0
        last_date = None
        
        for checkin in checkins.order_by('date'):
            if last_date and (checkin.date - last_date).days > 1:
                # Gap found, reset streak
                temp_max = max(temp_max, temp_streak)
                temp_streak = 0
            
            if checkin.value or checkin.used_insurance:
                temp_streak += 1
            else:
                temp_max = max(temp_max, temp_streak)
                temp_streak = 0
                
            last_date = checkin.date
        
        longest_streak = max(temp_max, temp_streak)
        
        return {
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'total_completions': total_completions,
            'total_checkins': total_checkins,
            'completion_rate': round((total_completions / total_checkins) * 100, 1) if total_checkins > 0 else 0,
            'insurance_available': self.get_insurance_count()
        }
    
    def get_insurance_count(self):
        """Calculate available insurance days based on streak"""
        current_streak = self.get_current_streak()
        
        # Earn 1 insurance day for every 7 days of streak
        earned_insurance = current_streak // 7
        
        # Count used insurance in current streak
        today = timezone.now().date()
        used_insurance = self.checkins.filter(
            date__gte=today - timezone.timedelta(days=current_streak),
            used_insurance=True
        ).count()
        
        return max(0, earned_insurance - used_insurance)
    
    def can_use_insurance(self):
        """Check if user can use insurance for today"""
        return self.get_insurance_count() > 0
    
    def use_insurance(self, date=None):
        """Use insurance for a specific date (default: today)"""
        if date is None:
            date = timezone.now().date()
            
        if not self.can_use_insurance():
            return False
            
        # Create or update checkin with insurance
        checkin, created = self.checkins.get_or_create(
            date=date,
            defaults={'value': False, 'used_insurance': True, 'channel': 'web'}
        )
        
        if not created and not checkin.used_insurance:
            checkin.used_insurance = True
            checkin.save()
            
        return True
    
    def get_comeback_status(self):
        """Check if user is in a comeback scenario"""
        today = timezone.now().date()
        
        # Get recent checkins
        recent_checkins = self.checkins.filter(
            date__gte=today - timezone.timedelta(days=7)
        ).order_by('-date')
        
        if not recent_checkins.exists():
            return {
                'is_comeback': False,
                'days_since_last': 0,
                'message': None
            }
        
        # Find the last successful checkin
        last_success = recent_checkins.filter(value=True).first()
        if not last_success:
            return {
                'is_comeback': False,
                'days_since_last': 0,
                'message': None
            }
        
        days_since_last = (today - last_success.date).days
        
        # Comeback scenarios
        if days_since_last >= 7:
            return {
                'is_comeback': True,
                'days_since_last': days_since_last,
                'message': f"Welcome back, hero! It's been {days_since_last} days. Ready to restart your quest?",
                'level': 'major'
            }
        elif days_since_last >= 3:
            return {
                'is_comeback': True,
                'days_since_last': days_since_last,
                'message': f"Time for a comeback! Let's get back on track after {days_since_last} days.",
                'level': 'moderate'
            }
        elif days_since_last >= 2:
            return {
                'is_comeback': True,
                'days_since_last': days_since_last,
                'message': "Don't let yesterday define today! Let's bounce back!",
                'level': 'minor'
            }
        
        return {
            'is_comeback': False,
            'days_since_last': days_since_last,
            'message': None
        }
    
    def get_motivational_message(self):
        """Get contextual motivational message based on streak and recent activity"""
        current_streak = self.get_current_streak()
        comeback_status = self.get_comeback_status()
        
        if comeback_status['is_comeback']:
            return comeback_status['message']
        
        if current_streak == 0:
            return "🌟 Every expert was once a beginner. Your journey starts now!"
        elif current_streak == 1:
            return "🎉 Great start! One day down, many more to go!"
        elif current_streak < 7:
            return f"🚀 {current_streak} days strong! You're building momentum!"
        elif current_streak < 21:
            return f"🔥 {current_streak} day streak! You're on fire!"
        elif current_streak < 30:
            return f"🏆 {current_streak} days! You're becoming unstoppable!"
        else:
            return f"👑 {current_streak} day streak! You're a true habit master!"


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
    note_embedding = VectorField(dimensions=768, null=True, blank=True)
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
    note_embedding = VectorField(dimensions=768, null=True, blank=True)
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
