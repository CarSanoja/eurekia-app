import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)


class EmailService:
    """Enhanced email service for kid-friendly notifications"""
    
    @staticmethod
    def send_otp_email(user_email, otp_code, user_name=None):
        """Send OTP email with kid-friendly design"""
        try:
            subject = "🚀 Your Quanta Login Code!"
            
            # Kid-friendly email content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Your Quanta Login Code</title>
            </head>
            <body style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 60px; margin-bottom: 20px;">🚀</div>
                        <h1 style="color: #667eea; margin: 0; font-size: 28px;">Hey {"there" if not user_name else user_name}! 🎉</h1>
                        <p style="color: #666; font-size: 18px; margin-top: 10px;">Ready to continue your hero journey?</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0;">
                        <p style="color: #333; font-size: 18px; margin-bottom: 15px;">Your login code is:</p>
                        <div style="background: white; border-radius: 10px; padding: 20px; display: inline-block; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                            <span style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 5px;">{otp_code}</span>
                        </div>
                        <p style="color: #333; font-size: 14px; margin-top: 15px;">⏰ This code expires in 10 minutes</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #666; font-size: 16px;">🎮 Ready to level up your habits?</p>
                        <p style="color: #999; font-size: 14px; margin-top: 20px;">
                            If you didn't request this code, you can safely ignore this email.
                        </p>
                    </div>
                    
                    <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
                        <p style="color: #999; font-size: 12px;">
                            Made with ❤️ by the Quanta team<br>
                            Building heroes, one habit at a time! 💪
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text version
            text_content = f"""
            Hey {"there" if not user_name else user_name}! 🎉
            
            Ready to continue your hero journey?
            
            Your login code is: {otp_code}
            
            This code expires in 10 minutes.
            
            Ready to level up your habits? 🎮
            
            If you didn't request this code, you can safely ignore this email.
            
            Made with ❤️ by the Quanta team
            Building heroes, one habit at a time! 💪
            """
            
            # Create email
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user_email],
            )
            email.attach_alternative(html_content, "text/html")
            
            # Send email
            result = email.send()
            
            if result:
                logger.info(f"OTP email sent successfully to {user_email}")
                return True
            else:
                logger.error(f"Failed to send OTP email to {user_email}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending OTP email to {user_email}: {str(e)}")
            return False
    
    @staticmethod
    def send_habit_reminder(user, habit):
        """Send habit reminder with motivational content"""
        try:
            subject = f"🔥 Time to complete your quest: {habit.title}!"
            
            streak_emoji = "🔥" if habit.current_streak > 0 else "🌟"
            encouragement = EmailService._get_encouragement_message(habit.current_streak)
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Quest Reminder</title>
            </head>
            <body style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 60px; margin-bottom: 20px;">{streak_emoji}</div>
                        <h1 style="color: #ff6b6b; margin: 0; font-size: 28px;">Hey {user.name}! 💪</h1>
                        <p style="color: #666; font-size: 18px; margin-top: 10px;">{encouragement}</p>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0;">
                        <h2 style="color: white; margin: 0 0 10px 0; font-size: 24px;">🎯 Your Quest</h2>
                        <p style="color: white; font-size: 20px; font-weight: bold; margin: 10px 0;">{habit.title}</p>
                        {f'<p style="color: white; font-size: 16px;">Current streak: {habit.current_streak} days {streak_emoji}</p>' if habit.current_streak > 0 else ''}
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://quanta.app" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; font-size: 18px; display: inline-block;">
                            ✅ Complete Quest Now!
                        </a>
                    </div>
                    
                    <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
                        <p style="color: #999; font-size: 12px;">
                            Keep building those epic habits! 🚀<br>
                            You're doing amazing! 🌟
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            Hey {user.name}! 💪
            
            {encouragement}
            
            🎯 Your Quest: {habit.title}
            {f'Current streak: {habit.current_streak} days {streak_emoji}' if habit.current_streak > 0 else ''}
            
            Complete your quest at: https://quanta.app
            
            Keep building those epic habits! 🚀
            You're doing amazing! 🌟
            """
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )
            email.attach_alternative(html_content, "text/html")
            
            result = email.send()
            
            if result:
                logger.info(f"Habit reminder sent to {user.email} for habit {habit.title}")
                return True
            else:
                logger.error(f"Failed to send habit reminder to {user.email}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending habit reminder: {str(e)}")
            return False
    
    @staticmethod
    def send_achievement_notification(user, achievement_type, details):
        """Send achievement notification"""
        try:
            achievements = {
                'first_habit': {'emoji': '🌟', 'title': 'First Quest Completed!', 'message': 'You\'ve started your hero journey!'},
                'streak_7': {'emoji': '🔥', 'title': 'Week Warrior!', 'message': 'Amazing! 7 days in a row!'},
                'streak_30': {'emoji': '💎', 'title': 'Diamond Hero!', 'message': 'Incredible! 30 days of consistency!'},
                'level_up': {'emoji': '⚡', 'title': 'Level Up!', 'message': f'You\'ve reached level {details.get("level", "2")}!'},
            }
            
            achievement = achievements.get(achievement_type, achievements['first_habit'])
            
            subject = f"{achievement['emoji']} {achievement['title']}"
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Achievement Unlocked!</title>
            </head>
            <body style="font-family: Arial, sans-serif; background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); margin: 0; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="font-size: 80px; margin-bottom: 20px; animation: bounce 2s infinite;">{achievement['emoji']}</div>
                        <h1 style="color: #19547b; margin: 0; font-size: 32px;">Achievement Unlocked!</h1>
                        <h2 style="color: #ffd89b; margin: 10px 0; font-size: 24px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">{achievement['title']}</h2>
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0;">
                        <h3 style="color: white; margin: 0; font-size: 20px;">Hey {user.name}! 🎉</h3>
                        <p style="color: white; font-size: 18px; margin: 15px 0;">{achievement['message']}</p>
                        <p style="color: white; font-size: 16px;">Keep up the amazing work, hero! 💪</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://quanta.app" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; font-size: 18px; display: inline-block;">
                            🚀 Continue Your Journey!
                        </a>
                    </div>
                    
                    <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
                        <p style="color: #999; font-size: 12px;">
                            You're building something amazing! 🌟<br>
                            Every small step counts! ✨
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            🎉 Achievement Unlocked! 🎉
            
            {achievement['title']}
            
            Hey {user.name}!
            
            {achievement['message']}
            
            Keep up the amazing work, hero! 💪
            
            Continue your journey at: https://quanta.app
            
            You're building something amazing! 🌟
            Every small step counts! ✨
            """
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email],
            )
            email.attach_alternative(html_content, "text/html")
            
            result = email.send()
            
            if result:
                logger.info(f"Achievement notification sent to {user.email}: {achievement_type}")
                return True
            else:
                logger.error(f"Failed to send achievement notification to {user.email}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending achievement notification: {str(e)}")
            return False
    
    @staticmethod
    def _get_encouragement_message(streak):
        """Get motivational message based on streak"""
        if streak == 0:
            return "Ready to start building your epic streak? 🌟"
        elif streak < 7:
            return f"You're on fire! {streak} days strong! 🔥"
        elif streak < 30:
            return f"Incredible dedication! {streak} days of consistency! 💪"
        else:
            return f"You're a true hero! {streak} days of pure awesomeness! 👑"