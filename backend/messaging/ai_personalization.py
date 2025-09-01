"""
AI-Powered Email Personalization using Gemini Flash
Enhances email content with personalized insights and recommendations
"""
import logging
from datetime import datetime, timedelta
from django.utils import timezone

from ai_services.langgraph_service import langgraph_ai_service

logger = logging.getLogger(__name__)


class AIEmailPersonalizer:
    """AI-powered email personalization service"""
    
    @staticmethod
    def generate_personalized_subject(user, template_key, context=None):
        """Generate personalized email subject line using AI"""
        try:
            if not langgraph_ai_service.ai_available:
                return AIEmailPersonalizer._get_fallback_subject(template_key)
            
            # Gather user context
            user_context = AIEmailPersonalizer._gather_user_context(user)
            
            # Create prompt for subject line generation
            prompt = f"""
            Generate a personalized email subject line for a teen user in the Quanta habit tracking app.
            
            User Info:
            - Name: {user.name or 'Hero'}
            - Current habits: {user_context.get('active_habits', 0)}
            - Days since last activity: {user_context.get('days_since_activity', 0)}
            - Best streak: {user_context.get('best_streak', 0)}
            
            Email Type: {template_key}
            Context: {context or {}}
            
            Requirements:
            - Keep it under 50 characters
            - Use emojis appropriately
            - Be encouraging and teen-friendly
            - Create urgency/excitement without being pushy
            - Personalize with user's name or achievements when relevant
            
            Generate 3 subject line options and return just the best one.
            """
            
            # Generate using LangGraph service
            response = langgraph_ai_service.llm.invoke(prompt)
            
            if response and len(response.strip()) > 0:
                # Extract the best subject line
                subject = response.strip().split('\n')[0]
                # Remove any numbering or formatting
                subject = subject.replace('1.', '').replace('-', '').strip()
                
                # Ensure it's not too long
                if len(subject) > 60:
                    subject = subject[:57] + '...'
                
                logger.info(f"Generated personalized subject for {user.email}: {subject}")
                return subject
            else:
                return AIEmailPersonalizer._get_fallback_subject(template_key)
                
        except Exception as e:
            logger.error(f"Error generating personalized subject: {str(e)}")
            return AIEmailPersonalizer._get_fallback_subject(template_key)
    
    @staticmethod
    def generate_personalized_content(user, template_key, base_content, context=None):
        """Enhance base email content with personalized AI insights"""
        try:
            if not langgraph_ai_service.ai_available:
                return base_content
            
            # Gather comprehensive user context
            user_context = AIEmailPersonalizer._gather_user_context(user)
            
            # Create prompt for content enhancement
            prompt = f"""
            Enhance this email content with personalized insights for a teen user in Quanta habit tracker.
            
            User Profile:
            - Name: {user.name or 'Hero'}
            - Active habits: {user_context.get('active_habits', 0)}
            - Current streaks: {user_context.get('current_streaks', [])}
            - Best streak ever: {user_context.get('best_streak', 0)}
            - Recent activity: {user_context.get('recent_activity', 'Unknown')}
            - Mood trend: {user_context.get('mood_trend', 'Stable')}
            - Completion rate: {user_context.get('completion_rate', 0)}%
            - Days since last activity: {user_context.get('days_since_activity', 0)}
            
            Email Template: {template_key}
            Additional Context: {context or {}}
            
            Enhancement Instructions:
            1. Add a personalized insight based on user's habit data
            2. Include a specific encouragement related to their progress
            3. Suggest a relevant next action or challenge
            4. Keep the tone positive, teen-friendly, and motivational
            5. Don't replace the entire content, just add 2-3 personalized sentences
            6. Use emojis appropriately
            
            Return only the additional personalized content to insert, not the entire email.
            """
            
            # Generate personalization using LangGraph
            response = langgraph_ai_service.llm.invoke(prompt)
            
            if response and len(response.strip()) > 0:
                personalized_content = response.strip()
                
                # Insert the personalized content into the base template
                enhanced_content = AIEmailPersonalizer._insert_personalized_content(
                    base_content, 
                    personalized_content
                )
                
                logger.info(f"Generated personalized content for {user.email}")
                return enhanced_content
            else:
                return base_content
                
        except Exception as e:
            logger.error(f"Error generating personalized content: {str(e)}")
            return base_content
    
    @staticmethod
    def generate_optimal_send_time(user, template_key):
        """Use AI to determine optimal send time for user"""
        try:
            if not langgraph_ai_service.ai_available:
                return AIEmailPersonalizer._get_default_send_time(template_key)
            
            # Gather user activity patterns
            user_context = AIEmailPersonalizer._gather_user_context(user)
            activity_patterns = AIEmailPersonalizer._analyze_user_activity_patterns(user)
            
            prompt = f"""
            Determine the optimal time to send an email to a teen user based on their activity patterns.
            
            User Activity Data:
            - Most active hours: {activity_patterns.get('most_active_hours', 'Unknown')}
            - Typical check-in times: {activity_patterns.get('checkin_times', 'Unknown')}
            - Weekend vs weekday activity: {activity_patterns.get('weekend_pattern', 'Unknown')}
            - Time zone: {user_context.get('timezone', 'Unknown')}
            
            Email Type: {template_key}
            
            Consider:
            - Teen schedules (school hours, after-school activities)
            - Email type urgency and purpose
            - Best engagement times for habit reminders
            - Avoid too early (before 7 AM) or too late (after 9 PM)
            
            Return the optimal hour (0-23) as a single number.
            """
            
            response = langgraph_ai_service.llm.invoke(prompt)
            
            if response and response.strip().isdigit():
                optimal_hour = int(response.strip())
                
                # Validate the hour is reasonable
                if 7 <= optimal_hour <= 21:  # Between 7 AM and 9 PM
                    logger.info(f"AI recommended send time for {user.email}: {optimal_hour}:00")
                    return optimal_hour
            
            return AIEmailPersonalizer._get_default_send_time(template_key)
            
        except Exception as e:
            logger.error(f"Error generating optimal send time: {str(e)}")
            return AIEmailPersonalizer._get_default_send_time(template_key)
    
    @staticmethod
    def generate_dynamic_recommendations(user, context=None):
        """Generate dynamic habit recommendations using AI"""
        try:
            if not langgraph_ai_service.ai_available:
                return AIEmailPersonalizer._get_fallback_recommendations()
            
            # Gather user context
            user_context = AIEmailPersonalizer._gather_user_context(user)
            
            prompt = f"""
            Generate 3 personalized habit recommendations for a teen user based on their current progress.
            
            User Profile:
            - Name: {user.name or 'Hero'}
            - Current habits: {user_context.get('habit_titles', [])}
            - Completion rate: {user_context.get('completion_rate', 0)}%
            - Current challenges: {user_context.get('challenges', 'Unknown')}
            - Best streak: {user_context.get('best_streak', 0)} days
            - Recent mood: {user_context.get('recent_mood', 'Unknown')}
            
            Additional Context: {context or {}}
            
            Requirements:
            1. Make recommendations specific and actionable
            2. Consider their current habits to avoid conflicts
            3. Use teen-friendly language with appropriate emojis
            4. Focus on building existing strengths or addressing gaps
            5. Each recommendation should be 1-2 sentences maximum
            
            Return as a JSON array of strings: ["recommendation1", "recommendation2", "recommendation3"]
            """
            
            response = langgraph_ai_service.llm.invoke(prompt)
            
            # Parse the JSON response
            import json
            import re
            
            # Try to extract JSON array from response
            json_match = re.search(r'\[.*\]', response, re.DOTALL)
            if json_match:
                try:
                    recommendations = json.loads(json_match.group())
                    if isinstance(recommendations, list) and len(recommendations) >= 3:
                        logger.info(f"Generated AI recommendations for {user.email}")
                        return recommendations[:3]
                except json.JSONDecodeError:
                    pass
            
            return AIEmailPersonalizer._get_fallback_recommendations()
            
        except Exception as e:
            logger.error(f"Error generating dynamic recommendations: {str(e)}")
            return AIEmailPersonalizer._get_fallback_recommendations()
    
    @staticmethod
    def _gather_user_context(user):
        """Gather comprehensive user context for AI personalization"""
        try:
            from habits.models import Habit, Checkin, Mood
            
            # Get user's habits
            habits = Habit.objects.filter(user=user, is_active=True)
            
            # Calculate basic stats
            active_habits = habits.count()
            habit_titles = [h.title for h in habits[:5]]  # Top 5 habits
            
            # Get current streaks
            current_streaks = []
            best_streak = 0
            
            for habit in habits:
                streak = habit.get_current_streak()
                current_streaks.append(streak)
                if streak > best_streak:
                    best_streak = streak
            
            # Calculate completion rate (last 7 days)
            week_ago = timezone.now() - timedelta(days=7)
            total_possible = active_habits * 7
            completed = Checkin.objects.filter(
                habit__user=user,
                date__gte=week_ago.date(),
                value=True
            ).count()
            
            completion_rate = (completed / total_possible * 100) if total_possible > 0 else 0
            
            # Get recent activity
            last_checkin = Checkin.objects.filter(
                habit__user=user
            ).order_by('-created_at').first()
            
            days_since_activity = 0
            if last_checkin:
                days_since_activity = (timezone.now().date() - last_checkin.date).days
            
            # Get recent mood
            recent_mood = Mood.objects.filter(user=user).order_by('-date').first()
            mood_trend = 'Unknown'
            if recent_mood:
                if recent_mood.score >= 4:
                    mood_trend = 'Positive'
                elif recent_mood.score >= 3:
                    mood_trend = 'Stable'
                else:
                    mood_trend = 'Needs Support'
            
            # Determine recent activity status
            if days_since_activity == 0:
                recent_activity = 'Very Active'
            elif days_since_activity <= 2:
                recent_activity = 'Active'
            elif days_since_activity <= 7:
                recent_activity = 'Moderately Active'
            else:
                recent_activity = 'Inactive'
            
            return {
                'active_habits': active_habits,
                'habit_titles': habit_titles,
                'current_streaks': current_streaks,
                'best_streak': best_streak,
                'completion_rate': round(completion_rate, 1),
                'days_since_activity': days_since_activity,
                'recent_activity': recent_activity,
                'mood_trend': mood_trend,
                'challenges': AIEmailPersonalizer._identify_challenges(completion_rate, days_since_activity)
            }
            
        except Exception as e:
            logger.error(f"Error gathering user context: {str(e)}")
            return {}
    
    @staticmethod
    def _analyze_user_activity_patterns(user):
        """Analyze user's activity patterns for optimal timing"""
        try:
            from habits.models import Checkin
            
            # Get checkins from last 30 days
            month_ago = timezone.now() - timedelta(days=30)
            checkins = Checkin.objects.filter(
                habit__user=user,
                created_at__gte=month_ago
            )
            
            # Analyze check-in times
            checkin_hours = [c.created_at.hour for c in checkins]
            
            # Find most common hours
            hour_counts = {}
            for hour in checkin_hours:
                hour_counts[hour] = hour_counts.get(hour, 0) + 1
            
            # Get top 3 most active hours
            most_active_hours = sorted(hour_counts.items(), key=lambda x: x[1], reverse=True)[:3]
            most_active_hours = [h[0] for h in most_active_hours]
            
            # Analyze weekend vs weekday patterns
            weekend_checkins = 0
            weekday_checkins = 0
            
            for checkin in checkins:
                if checkin.created_at.weekday() >= 5:  # Weekend
                    weekend_checkins += 1
                else:
                    weekday_checkins += 1
            
            weekend_pattern = 'More active on weekends' if weekend_checkins > weekday_checkins else 'More active on weekdays'
            
            return {
                'most_active_hours': most_active_hours,
                'checkin_times': f"Usually active around {most_active_hours[0] if most_active_hours else 19}:00",
                'weekend_pattern': weekend_pattern
            }
            
        except Exception as e:
            logger.error(f"Error analyzing activity patterns: {str(e)}")
            return {}
    
    @staticmethod
    def _identify_challenges(completion_rate, days_since_activity):
        """Identify user challenges based on their data"""
        challenges = []
        
        if completion_rate < 50:
            challenges.append('low completion rate')
        
        if days_since_activity > 3:
            challenges.append('recent inactivity')
        
        if not challenges:
            challenges.append('maintaining consistency')
        
        return ', '.join(challenges)
    
    @staticmethod
    def _insert_personalized_content(base_content, personalized_content):
        """Insert personalized content into base email template"""
        try:
            # Look for insertion points in the base content
            insertion_markers = [
                '<div class="content">',
                '<p style="font-size: 16px; color: #4a5568; margin: 25px 0;">',
                'You're doing amazing!'
            ]
            
            for marker in insertion_markers:
                if marker in base_content:
                    # Create personalized section
                    personalized_section = f"""
                    <div style="background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%); 
                                border-radius: 12px; padding: 20px; margin: 25px 0; 
                                border-left: 4px solid #38b2ac;">
                        <h4 style="color: #234e52; font-size: 18px; margin-bottom: 10px;">
                            💡 Personal Insight Just for You
                        </h4>
                        <p style="color: #234e52; font-size: 16px; margin: 0;">
                            {personalized_content}
                        </p>
                    </div>
                    """
                    
                    # Insert after the marker
                    parts = base_content.split(marker, 1)
                    if len(parts) == 2:
                        return parts[0] + marker + personalized_section + parts[1]
            
            # If no insertion point found, append at the end of content
            if '</div>' in base_content:
                return base_content.replace('</div>', f'<div>{personalized_content}</div></div>', 1)
            
            return base_content + f'<p>{personalized_content}</p>'
            
        except Exception as e:
            logger.error(f"Error inserting personalized content: {str(e)}")
            return base_content
    
    @staticmethod
    def _get_fallback_subject(template_key):
        """Get fallback subject lines when AI is unavailable"""
        fallback_subjects = {
            'welcome_hero': '🚀 Welcome to Your Hero Journey!',
            'first_habit_created': '🎯 Your First Quest is Ready!',
            'first_week_milestone': '🔥 7 Days Strong - You\'re On Fire!',
            'streak_recovery': '💪 Every Hero Has Comebacks!',
            'badge_unlock': '🏆 Achievement Unlocked!',
            'monthly_progress': '📊 Your Monthly Hero Report!',
        }
        
        return fallback_subjects.get(template_key, '🌟 Message from Quanta!')
    
    @staticmethod
    def _get_default_send_time(template_key):
        """Get default send times by template type"""
        default_times = {
            'welcome_hero': 10,  # 10 AM
            'first_habit_created': 11,  # 11 AM
            'habit_reminder': 19,  # 7 PM
            'streak_recovery': 16,  # 4 PM
            'badge_unlock': 12,  # 12 PM
            'weekly_summary': 18,  # 6 PM
        }
        
        return default_times.get(template_key, 19)  # Default to 7 PM
    
    @staticmethod
    def _get_fallback_recommendations():
        """Get fallback recommendations when AI is unavailable"""
        return [
            "🌅 Try adding a morning routine to kickstart your day with energy!",
            "📚 Consider a 10-minute reading habit before bed for better sleep!",
            "💧 Stay hydrated by tracking your daily water intake!"
        ]