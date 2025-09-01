from celery import shared_task
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from datetime import datetime, timedelta
import logging

from accounts.models import User, ChannelPreference
from habits.models import Habit, Checkin
from messaging.models import OutboundMessage
from messaging.email_service import EmailService
from messaging.aha_moments import AhaMoments, AhaMomentScheduler
from messaging.email_templates import EmailTemplates

logger = logging.getLogger(__name__)


@shared_task
def send_habit_reminder(habit_id, user_id):
    """Send habit reminder notification"""
    try:
        habit = Habit.objects.get(id=habit_id, user_id=user_id)
        user = User.objects.get(id=user_id)
        
        # Check if user has opted in for notifications
        try:
            prefs = ChannelPreference.objects.get(user=user, channel='email')
            if not prefs.allow_prompts:
                logger.info(f"User {user.email} has disabled habit reminders")
                return
        except ChannelPreference.DoesNotExist:
            # Default to allowing notifications for new users
            pass
        
        # Check quiet hours (default 10 PM - 8 AM)
        current_hour = timezone.now().hour
        if current_hour >= 22 or current_hour < 8:
            logger.info(f"Skipping reminder during quiet hours: {current_hour}:00")
            return
        
        # Check if user already completed habit today
        today = timezone.now().date()
        if Checkin.objects.filter(habit=habit, date=today).exists():
            logger.info(f"User already completed habit {habit.title} today")
            return
        
        # Send reminder
        success = EmailService.send_habit_reminder(user, habit)
        
        # Log the message
        OutboundMessage.objects.create(
            user=user,
            channel='email',
            message_type='habit_reminder',
            content=f"Reminder: {habit.title}",
            status='sent' if success else 'failed',
            sent_at=timezone.now() if success else None
        )
        
        if success:
            logger.info(f"Habit reminder sent successfully to {user.email}")
        else:
            logger.error(f"Failed to send habit reminder to {user.email}")
            
    except Exception as e:
        logger.error(f"Error in send_habit_reminder task: {str(e)}")


@shared_task 
def send_achievement_notification(user_id, achievement_type, details=None):
    """Send achievement notification"""
    try:
        user = User.objects.get(id=user_id)
        
        # Check if user has opted in for achievement notifications
        try:
            prefs = ChannelPreference.objects.get(user=user, channel='email')
            if not prefs.allow_prompts:
                logger.info(f"User {user.email} has disabled achievement notifications")
                return
        except ChannelPreference.DoesNotExist:
            # Default to allowing notifications for new users
            pass
        
        # Send achievement notification
        success = EmailService.send_achievement_notification(
            user, achievement_type, details or {}
        )
        
        # Log the message
        OutboundMessage.objects.create(
            user=user,
            channel='email',
            message_type='achievement',
            content=f"Achievement: {achievement_type}",
            status='sent' if success else 'failed',
            sent_at=timezone.now() if success else None
        )
        
        if success:
            logger.info(f"Achievement notification sent to {user.email}: {achievement_type}")
        else:
            logger.error(f"Failed to send achievement notification to {user.email}")
            
    except Exception as e:
        logger.error(f"Error in send_achievement_notification task: {str(e)}")


@shared_task
def schedule_daily_reminders():
    """Schedule habit reminders for all active users"""
    try:
        current_time = timezone.now()
        reminder_hour = 19  # 7 PM default reminder time
        
        # Get all active habits that need reminders
        habits = Habit.objects.filter(
            is_active=True,
            cadence='daily',
            user__is_active=True
        ).select_related('user')
        
        count = 0
        for habit in habits:
            # Check if user already completed today
            today = current_time.date()
            if not Checkin.objects.filter(habit=habit, date=today).exists():
                # Schedule reminder
                send_habit_reminder.apply_async(
                    args=[str(habit.id), str(habit.user.id)],
                    eta=current_time.replace(hour=reminder_hour, minute=0, second=0)
                )
                count += 1
        
        logger.info(f"Scheduled {count} habit reminders for today")
        
    except Exception as e:
        logger.error(f"Error in schedule_daily_reminders task: {str(e)}")


@shared_task
def check_streak_achievements():
    """Check for streak achievements and send notifications"""
    try:
        # Check for users with new streak milestones
        streak_milestones = [1, 3, 7, 14, 21, 30, 60, 90, 365]
        
        for milestone in streak_milestones:
            # Find habits that just reached this streak
            habits = Habit.objects.filter(
                is_active=True,
                user__is_active=True
            ).select_related('user')
            
            for habit in habits:
                current_streak = habit.get_current_streak()
                if current_streak == milestone:
                    # Check if we already sent this achievement
                    recent_achievement = OutboundMessage.objects.filter(
                        user=habit.user,
                        message_type='achievement',
                        content__contains=f'streak_{milestone}',
                        sent_at__gte=timezone.now() - timedelta(days=1)
                    ).exists()
                    
                    if not recent_achievement:
                        achievement_type = 'first_habit' if milestone == 1 else f'streak_{milestone}'
                        details = {
                            'streak': milestone,
                            'habit': habit.title
                        }
                        
                        send_achievement_notification.delay(
                            str(habit.user.id),
                            achievement_type,
                            details
                        )
        
        logger.info("Completed streak achievement check")
        
    except Exception as e:
        logger.error(f"Error in check_streak_achievements task: {str(e)}")


@shared_task
def send_weekly_progress_summary(user_id):
    """Send weekly progress summary to user"""
    try:
        user = User.objects.get(id=user_id)
        
        # Get habit progress for the past week
        week_ago = timezone.now() - timedelta(days=7)
        habits = Habit.objects.filter(user=user, is_active=True)
        
        total_habits = habits.count()
        completed_checkins = Checkin.objects.filter(
            habit__user=user,
            date__gte=week_ago.date()
        ).count()
        
        # Calculate completion rate
        possible_checkins = total_habits * 7
        completion_rate = (completed_checkins / possible_checkins * 100) if possible_checkins > 0 else 0
        
        # Send summary email
        subject = f"🌟 Your Weekly Hero Summary!"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Weekly Progress Summary</title>
        </head>
        <body style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 60px; margin-bottom: 20px;">📊</div>
                    <h1 style="color: #667eea; margin: 0; font-size: 28px;">Weekly Hero Summary</h1>
                    <p style="color: #666; font-size: 18px;">Hey {user.name}! Here's how you did this week! 🎉</p>
                </div>
                
                <div style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); border-radius: 15px; padding: 30px; margin: 30px 0;">
                    <h2 style="color: white; text-align: center; margin-bottom: 20px;">Your Stats</h2>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center;">
                        <div style="background: white; border-radius: 10px; padding: 20px;">
                            <div style="font-size: 32px; font-weight: bold; color: #667eea;">{total_habits}</div>
                            <div style="color: #666;">Active Quests</div>
                        </div>
                        <div style="background: white; border-radius: 10px; padding: 20px;">
                            <div style="font-size: 32px; font-weight: bold; color: #667eea;">{completed_checkins}</div>
                            <div style="color: #666;">Completed</div>
                        </div>
                    </div>
                    <div style="background: white; border-radius: 10px; padding: 20px; margin-top: 20px; text-align: center;">
                        <div style="font-size: 32px; font-weight: bold; color: #667eea;">{completion_rate:.1f}%</div>
                        <div style="color: #666;">Completion Rate</div>
                    </div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <p style="color: #666; font-size: 16px;">{"Amazing work! Keep it up! 🌟" if completion_rate >= 70 else "Every step counts! You're building great habits! 💪"}</p>
                    <a href="https://quanta.app" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; display: inline-block; margin-top: 20px;">
                        🚀 Continue Your Journey
                    </a>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Use EmailMultiAlternatives for HTML email
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings
        
        text_content = f"""
        Weekly Hero Summary for {user.name}!
        
        Your Stats This Week:
        - Active Quests: {total_habits}
        - Completed: {completed_checkins}
        - Completion Rate: {completion_rate:.1f}%
        
        {"Amazing work! Keep it up! 🌟" if completion_rate >= 70 else "Every step counts! You're building great habits! 💪"}
        
        Continue your journey at: https://quanta.app
        """
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.attach_alternative(html_content, "text/html")
        
        success = email.send()
        
        # Log the message
        OutboundMessage.objects.create(
            user=user,
            channel='email',
            message_type='weekly_summary',
            content=f"Weekly summary - {completion_rate:.1f}% completion",
            status='sent' if success else 'failed',
            sent_at=timezone.now() if success else None
        )
        
        if success:
            logger.info(f"Weekly summary sent to {user.email}")
        else:
            logger.error(f"Failed to send weekly summary to {user.email}")
            
    except Exception as e:
        logger.error(f"Error in send_weekly_progress_summary task: {str(e)}")


@shared_task
def cleanup_old_messages():
    """Clean up old outbound messages to save database space"""
    try:
        # Delete messages older than 90 days
        cutoff_date = timezone.now() - timedelta(days=90)
        deleted_count = OutboundMessage.objects.filter(
            sent_at__lt=cutoff_date
        ).delete()[0]
        
        logger.info(f"Cleaned up {deleted_count} old messages")
        
    except Exception as e:
        logger.error(f"Error in cleanup_old_messages task: {str(e)}")


@shared_task(bind=True, max_retries=3)
def send_aha_moment_email(self, user_id, moment_key, context=None):
    """
    Send an aha moment email to a user using advanced templates
    
    Args:
        user_id: UUID string of the user
        moment_key: Key identifying which aha moment to send
        context: Additional context data for personalization
    """
    try:
        # Get user and moment
        user = User.objects.get(id=user_id)
        moment = AhaMoments.get_moment_by_key(moment_key)
        
        if not moment:
            logger.error(f"Unknown aha moment: {moment_key}")
            return False
        
        # Check if user has opted out or is inactive
        if not user.is_active:
            logger.info(f"Skipping email to inactive user: {user.email}")
            return False
        
        # Generate personalized email content
        html_content = get_personalized_email_content(user, moment_key, context or {})
        if not html_content:
            logger.error(f"Failed to generate email content for {moment_key}")
            return False
        
        # Extract subject from moment definition
        subject = moment.get('subject', f'Message from Quanta')
        
        # Create plain text version (simplified)
        text_content = create_text_version(html_content)
        
        # Create and send email with tracking
        success = send_email_with_analytics(
            user=user,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            template_key=moment_key,
            context=context or {}
        )
        
        if success:
            logger.info(f"Successfully sent {moment_key} email to {user.email}")
        else:
            logger.error(f"Failed to send {moment_key} email to {user.email}")
            
        return success
        
    except User.DoesNotExist:
        logger.error(f"User not found: {user_id}")
        return False
        
    except Exception as exc:
        logger.error(f"Error sending aha moment email: {str(exc)}")
        
        # Retry logic
        if self.request.retries < self.max_retries:
            logger.info(f"Retrying {moment_key} email for user {user_id} (attempt {self.request.retries + 1})")
            raise self.retry(countdown=60 * (self.request.retries + 1), exc=exc)
        
        return False


def get_personalized_email_content(user, moment_key, context):
    """Generate personalized email content using advanced templates"""
    try:
        # Add user info to context
        personalized_context = {
            'user_name': user.name or 'Hero',
            'user_email': user.email,
            **context
        }
        
        # Get template based on moment key
        if moment_key == 'welcome_hero':
            return EmailTemplates.welcome_hero(
                user_name=personalized_context['user_name'],
                context=personalized_context
            )
        elif moment_key == 'first_habit_created':
            return EmailTemplates.first_habit_created(
                user_name=personalized_context['user_name'],
                habit_title=personalized_context.get('habit_title', 'Your Habit'),
                context=personalized_context
            )
        elif moment_key == 'first_week_milestone':
            return EmailTemplates.first_week_milestone(
                user_name=personalized_context['user_name'],
                habit_title=personalized_context.get('habit_title', 'Your Habit'),
                streak_days=personalized_context.get('streak_days', 7),
                context=personalized_context
            )
        elif moment_key == 'streak_recovery':
            return EmailTemplates.streak_recovery(
                user_name=personalized_context['user_name'],
                habit_title=personalized_context.get('habit_title', 'Your Habit'),
                broken_streak=personalized_context.get('broken_streak', 7),
                context=personalized_context
            )
        elif moment_key == 'badge_unlock':
            return EmailTemplates.badge_unlock(
                user_name=personalized_context['user_name'],
                badge_name=personalized_context.get('badge_name', 'Achievement'),
                badge_type=personalized_context.get('badge_type', 'foundation'),
                context=personalized_context
            )
        else:
            # Use generic welcome template for unknown moment keys
            return EmailTemplates.welcome_hero(
                user_name=personalized_context['user_name'],
                context=personalized_context
            )
            
    except Exception as e:
        logger.error(f"Error generating personalized content for {moment_key}: {str(e)}")
        return None


def create_text_version(html_content):
    """Create plain text version from HTML content"""
    try:
        # Simple HTML to text conversion
        import re
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', html_content)
        
        # Clean up whitespace
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        # Add some basic formatting
        text = text.replace('🚀', '🚀\n\n')
        text = text.replace('🎯', '🎯 ')
        text = text.replace('💪', '💪 ')
        
        return text[:2000] + '...' if len(text) > 2000 else text
        
    except Exception as e:
        logger.error(f"Error creating text version: {str(e)}")
        return "Please view this email in an HTML-capable email client."


def send_email_with_analytics(user, subject, html_content, text_content, template_key, context):
    """Send email with analytics tracking"""
    try:
        # Create outbound message record
        outbound_message = OutboundMessage.objects.create(
            user=user,
            channel='email',
            template_key=template_key,
            payload_json=context,
            status='queued'
        )
        
        # Create email
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )
        email.attach_alternative(html_content, "text/html")
        
        # Send email
        result = email.send()
        
        if result:
            # Update message status
            outbound_message.status = 'sent'
            outbound_message.sent_at = timezone.now()
            outbound_message.save()
            
            logger.info(f"Email sent successfully: {template_key} to {user.email}")
            return True
        else:
            outbound_message.status = 'failed'
            outbound_message.error_message = 'Email send failed'
            outbound_message.save()
            
            logger.error(f"Email send failed: {template_key} to {user.email}")
            return False
            
    except Exception as e:
        logger.error(f"Error sending email with analytics: {str(e)}")
        return False


@shared_task
def check_and_trigger_aha_moments():
    """Check for users who should receive aha moment emails"""
    try:
        # Check for inactive users (re-engagement)
        AhaMomentScheduler.check_inactive_users()
        
        # Check for other aha moment triggers
        users = User.objects.filter(is_active=True)
        
        for user in users:
            # Check for monthly report trigger (first of the month)
            if timezone.now().day == 1:
                AhaMomentScheduler.trigger_monthly_report(user)
        
        logger.info("Completed aha moments check")
        return True
        
    except Exception as e:
        logger.error(f"Error checking aha moments: {str(e)}")
        return False


@shared_task
def test_email_system():
    """Test the email system with a sample user"""
    try:
        # Get a test user (admin or first user)
        user = User.objects.filter(is_active=True).first()
        if not user:
            logger.error("No active users found for testing")
            return False
        
        # Send a test welcome email
        success = send_aha_moment_email.delay(
            str(user.id),
            'welcome_hero',
            {'test_mode': True}
        )
        
        logger.info(f"Test email queued for {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Error in test email system: {str(e)}")
        return False