"""
Aha Moments Email System - Strategic email sequences for user engagement
"""
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class AhaMoments:
    """Define strategic aha moments in user journey"""
    
    # Onboarding Series
    WELCOME_HERO = {
        'key': 'welcome_hero',
        'name': 'Welcome & First Mission',
        'trigger': 'user_signup',
        'delay': 0,  # immediate
        'subject': '🚀 Welcome to Quanta - Your Hero Journey Begins!',
        'category': 'onboarding',
        'description': 'First impression email welcoming new heroes'
    }
    
    FIRST_HABIT_CREATED = {
        'key': 'first_habit_created',
        'name': 'First Habit Created',
        'trigger': 'habit_created',
        'delay': 0,  # immediate
        'subject': '🎯 Your First Quest is Ready - Let\'s Do This!',
        'category': 'onboarding',
        'description': 'Celebrates first habit creation and explains check-ins'
    }
    
    FIRST_DAY_REMINDER = {
        'key': 'first_day_reminder',
        'name': '24hr Check-in Reminder',
        'trigger': 'habit_created',
        'delay': 1440,  # 24 hours in minutes
        'subject': '⏰ Ready for Your First Check-in, Hero?',
        'category': 'onboarding',
        'description': 'Gentle reminder for first habit check-in'
    }
    
    # Engagement Series
    FIRST_WEEK_MILESTONE = {
        'key': 'first_week_milestone',
        'name': 'First Week Milestone',
        'trigger': 'streak_reached',
        'condition': {'streak_days': 7},
        'subject': '🔥 7 Days Strong - You\'re On Fire!',
        'category': 'engagement',
        'description': 'Celebrates first week milestone with encouragement'
    }
    
    STREAK_RECOVERY = {
        'key': 'streak_recovery',
        'name': 'Streak Recovery Support',
        'trigger': 'streak_broken',
        'delay': 1440,  # 24 hours after streak breaks
        'subject': '💪 Every Hero Has Setbacks - Let\'s Bounce Back!',
        'category': 'engagement',
        'description': 'Supportive email when streak breaks, focuses on comeback'
    }
    
    MONTHLY_PROGRESS = {
        'key': 'monthly_progress',
        'name': 'Monthly Progress Report',
        'trigger': 'monthly_schedule',
        'subject': '📊 Your Monthly Hero Report is Here!',
        'category': 'engagement',
        'description': 'AI-powered monthly progress report with insights'
    }
    
    LEVEL_UP_CELEBRATION = {
        'key': 'level_up',
        'name': 'Level Up Celebration',
        'trigger': 'level_increased',
        'subject': '⚡ LEVEL UP! You\'ve Unlocked New Powers!',
        'category': 'engagement',
        'description': 'Celebrates user leveling up with new features'
    }
    
    # Re-engagement Series
    COME_BACK_HERO = {
        'key': 'come_back_hero',
        'name': 'Come Back Hero',
        'trigger': 'inactive_days',
        'condition': {'days_inactive': 3},
        'subject': '🌟 Your Quests are Waiting for You!',
        'category': 're-engagement',
        'description': 'Gentle re-engagement after 3 days inactive'
    }
    
    WE_MISS_YOU = {
        'key': 'we_miss_you',
        'name': 'We Miss You',
        'trigger': 'inactive_days',
        'condition': {'days_inactive': 7},
        'subject': '💔 We Miss Our Hero - Come Back to Your Journey!',
        'category': 're-engagement',
        'description': 'More urgent re-engagement after 1 week'
    }
    
    COMEBACK_SPECIAL = {
        'key': 'comeback_special',
        'name': 'Special Comeback Offer',
        'trigger': 'inactive_days',
        'condition': {'days_inactive': 14},
        'subject': '🎁 Special Powers Await - Welcome Back, Hero!',
        'category': 're-engagement',
        'description': 'Final re-engagement with special incentives'
    }
    
    # Achievement Series
    BADGE_UNLOCK = {
        'key': 'badge_unlock',
        'name': 'Badge Unlock Celebration',
        'trigger': 'badge_earned',
        'subject': '🏆 Achievement Unlocked - You Earned a Badge!',
        'category': 'achievement',
        'description': 'Celebrates specific badge achievements'
    }
    
    SEASONAL_CHALLENGE = {
        'key': 'seasonal_challenge',
        'name': 'Seasonal Challenge',
        'trigger': 'seasonal_event',
        'subject': '🎉 Special Challenge Alert - Limited Time!',
        'category': 'achievement',
        'description': 'Seasonal challenges and special events'
    }
    
    # Get all aha moments
    @classmethod
    def get_all_moments(cls):
        """Return all defined aha moments"""
        moments = []
        for attr_name in dir(cls):
            attr = getattr(cls, attr_name)
            if isinstance(attr, dict) and 'key' in attr:
                moments.append(attr)
        return moments
    
    @classmethod
    def get_moment_by_key(cls, key):
        """Get specific aha moment by key"""
        for moment in cls.get_all_moments():
            if moment['key'] == key:
                return moment
        return None
    
    @classmethod
    def get_moments_by_category(cls, category):
        """Get all moments in a specific category"""
        return [m for m in cls.get_all_moments() if m['category'] == category]
    
    @classmethod
    def get_moments_by_trigger(cls, trigger):
        """Get all moments for a specific trigger"""
        return [m for m in cls.get_all_moments() if m['trigger'] == trigger]


class AhaMomentScheduler:
    """Handle scheduling and triggering of aha moment emails"""
    
    @staticmethod
    def schedule_moment(user, moment_key, context=None, delay_minutes=None):
        """Schedule an aha moment email"""
        from .tasks import send_aha_moment_email
        
        moment = AhaMoments.get_moment_by_key(moment_key)
        if not moment:
            logger.error(f"Unknown aha moment: {moment_key}")
            return False
        
        # Use moment's default delay if not specified
        if delay_minutes is None:
            delay_minutes = moment.get('delay', 0)
        
        # Schedule the email
        if delay_minutes > 0:
            # Schedule for later using Celery
            send_aha_moment_email.apply_async(
                args=[str(user.id), moment_key, context or {}],
                countdown=delay_minutes * 60
            )
            logger.info(f"Scheduled {moment_key} for user {user.email} in {delay_minutes} minutes")
        else:
            # Send immediately
            send_aha_moment_email.delay(str(user.id), moment_key, context or {})
            logger.info(f"Queued {moment_key} for immediate delivery to {user.email}")
        
        return True
    
    @staticmethod
    def trigger_welcome_sequence(user):
        """Trigger the complete welcome sequence"""
        AhaMomentScheduler.schedule_moment(user, 'welcome_hero')
        logger.info(f"Welcome sequence started for {user.email}")
    
    @staticmethod
    def trigger_habit_created(user, habit):
        """Trigger emails when first habit is created"""
        # Check if this is user's first habit
        from habits.models import Habit
        habit_count = Habit.objects.filter(user=user, is_active=True).count()
        
        if habit_count == 1:  # First habit
            AhaMomentScheduler.schedule_moment(
                user, 
                'first_habit_created',
                context={'habit_title': habit.title, 'habit_difficulty': habit.difficulty_level}
            )
            
            # Schedule 24-hour reminder
            AhaMomentScheduler.schedule_moment(
                user,
                'first_day_reminder',
                context={'habit_title': habit.title},
                delay_minutes=1440  # 24 hours
            )
    
    @staticmethod
    def trigger_streak_milestone(user, habit, streak_days):
        """Trigger emails for streak milestones"""
        if streak_days == 7:
            AhaMomentScheduler.schedule_moment(
                user,
                'first_week_milestone',
                context={
                    'habit_title': habit.title,
                    'streak_days': streak_days,
                    'user_name': user.name
                }
            )
        elif streak_days in [14, 21, 30, 60, 100]:
            # Special milestone celebrations
            AhaMomentScheduler.schedule_moment(
                user,
                'level_up',
                context={
                    'habit_title': habit.title,
                    'streak_days': streak_days,
                    'milestone_type': f'{streak_days}_day_streak'
                }
            )
    
    @staticmethod
    def trigger_streak_broken(user, habit, broken_streak):
        """Trigger supportive email when streak breaks"""
        if broken_streak >= 7:  # Only for meaningful streaks
            AhaMomentScheduler.schedule_moment(
                user,
                'streak_recovery',
                context={
                    'habit_title': habit.title,
                    'broken_streak': broken_streak,
                    'user_name': user.name
                },
                delay_minutes=1440  # 24 hours delay for emotional processing
            )
    
    @staticmethod
    def trigger_badge_earned(user, badge):
        """Trigger email when user earns a badge"""
        AhaMomentScheduler.schedule_moment(
            user,
            'badge_unlock',
            context={
                'badge_type': badge.type,
                'badge_name': badge.get_type_display(),
                'user_name': user.name
            }
        )
    
    @staticmethod
    def check_inactive_users():
        """Check for inactive users and trigger re-engagement emails"""
        from accounts.models import User
        from django.db.models import Max
        
        # Get users and their last activity
        users = User.objects.annotate(
            last_checkin=Max('habits__checkins__created_at')
        ).filter(is_active=True)
        
        now = timezone.now()
        
        for user in users:
            if not user.last_checkin:
                continue
                
            days_inactive = (now - user.last_checkin).days
            
            # Trigger appropriate re-engagement emails
            if days_inactive == 3:
                AhaMomentScheduler.schedule_moment(user, 'come_back_hero')
            elif days_inactive == 7:
                AhaMomentScheduler.schedule_moment(user, 'we_miss_you')
            elif days_inactive == 14:
                AhaMomentScheduler.schedule_moment(user, 'comeback_special')
    
    @staticmethod
    def trigger_monthly_report(user):
        """Trigger monthly progress report"""
        AhaMomentScheduler.schedule_moment(
            user,
            'monthly_progress',
            context={'report_month': timezone.now().strftime('%B %Y')}
        )