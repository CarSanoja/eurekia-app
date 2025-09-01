from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
import logging

from habits.models import Habit, Checkin, Mood, Badge
from ai_services.langgraph_service import langgraph_ai_service

logger = logging.getLogger(__name__)


class ProgressReportView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Generate AI-powered progress report."""
        try:
            user = request.user
            
            # Check AI usage limits
            if not self._check_ai_limits(user):
                return Response({
                    'error': 'AI usage limit exceeded. Please try again later.'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Gather habit data for the user
            habits_data = self._gather_habits_data(user)
            
            # Generate AI report using LangGraph
            report = await langgraph_ai_service.generate_progress_report(user, habits_data)
            
            # Add metadata
            report.update({
                'generated_at': timezone.now().isoformat(),
                'user_id': str(user.id),
                'report_type': 'progress_report',
                'data_period': '30_days'
            })
            
            logger.info(f"Generated progress report for user {user.email}")
            
            return Response(report)
            
        except Exception as e:
            logger.error(f"Error generating progress report: {str(e)}")
            return Response({
                'error': 'Failed to generate report. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _check_ai_limits(self, user) -> bool:
        """Check if user is within AI usage limits."""
        # For now, always allow AI requests - implement rate limiting later
        # TODO: Implement proper rate limiting with AIUsage model
        return True
    
    def _gather_habits_data(self, user) -> dict:
        """Gather comprehensive habit data for AI analysis."""
        habits = Habit.objects.filter(user=user, is_active=True)
        
        # Date ranges
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Basic stats
        total_habits = habits.count()
        active_habits = habits.filter(is_active=True).count()
        
        # Completion rates
        week_checkins = Checkin.objects.filter(
            habit__user=user,
            date__gte=week_ago
        ).count()
        
        month_checkins = Checkin.objects.filter(
            habit__user=user,
            date__gte=month_ago
        ).count()
        
        possible_week_checkins = active_habits * 7
        possible_month_checkins = active_habits * 30
        
        completion_rate_7d = (week_checkins / possible_week_checkins * 100) if possible_week_checkins > 0 else 0
        completion_rate_30d = (month_checkins / possible_month_checkins * 100) if possible_month_checkins > 0 else 0
        
        # Streaks and patterns
        current_streaks = []
        longest_streak = 0
        
        for habit in habits:
            streak = habit.get_current_streak()
            if streak > 0:
                current_streaks.append({
                    'habit_title': habit.title,
                    'streak': streak
                })
            
            if streak > longest_streak:
                longest_streak = streak
        
        # Recent activity  
        recent_checkins = list(
            Checkin.objects.filter(
                habit__user=user,
                date__gte=week_ago
            ).values('habit__title', 'date', 'note')[:20]
        )
        
        # Weekly pattern
        weekly_pattern = {}
        for i in range(7):
            day_date = today - timedelta(days=i)
            day_checkins = Checkin.objects.filter(
                habit__user=user,
                date=day_date
            ).count()
            weekly_pattern[day_date.strftime('%A')] = day_checkins
        
        # Difficulty levels
        difficulty_levels = list(habits.values_list('difficulty_level', flat=True).distinct())
        
        return {
            'total_habits': total_habits,
            'active_habits': active_habits,
            'completion_rate_7d': completion_rate_7d,
            'completion_rate_30d': completion_rate_30d,
            'overall_completion_rate': completion_rate_30d,
            'longest_streak': longest_streak,
            'current_streaks': current_streaks,
            'recent_checkins': recent_checkins,
            'weekly_pattern': weekly_pattern,
            'difficulty_levels': difficulty_levels
        }


class HeroReportView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Generate hero infographic with motivational message."""
        try:
            user = request.user
            
            # Check AI usage limits
            if not self._check_ai_limits(user):
                return Response({
                    'error': 'AI usage limit exceeded. Please try again later.'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Get recent achievements and progress
            habits_data = self._gather_hero_data(user)
            
            # Generate motivational message using LangGraph
            context = f"User has {habits_data['active_habits']} active habits with {habits_data['completion_rate']:.1f}% completion rate"
            # Create a simple habits data structure for the LangGraph service
            simple_habits_data = {
                'total_habits': habits_data['active_habits'],
                'overall_completion_rate': habits_data['completion_rate'],
                'longest_streak': habits_data['longest_streak']
            }
            ai_report = await langgraph_ai_service.generate_progress_report(user, simple_habits_data)
            motivational_message = ai_report.get('motivational_message', 'Keep building those amazing habits! 🚀')
            
            # Create hero report data
            hero_report = {
                'title': f"{user.name}'s Hero Journey! 🦸‍♂️",
                'motivational_message': motivational_message,
                'stats': {
                    'total_habits': habits_data['active_habits'],
                    'completion_rate': habits_data['completion_rate'],
                    'longest_streak': habits_data['longest_streak'],
                    'level': self._calculate_user_level(habits_data)
                },
                'achievements': habits_data['recent_achievements'],
                'generated_at': timezone.now().isoformat(),
                'report_type': 'hero_infographic'
            }
            
            logger.info(f"Generated hero report for user {user.email}")
            
            return Response(hero_report)
            
        except Exception as e:
            logger.error(f"Error generating hero report: {str(e)}")
            return Response({
                'error': 'Failed to generate hero report. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _check_ai_limits(self, user) -> bool:
        """Check if user is within AI usage limits."""
        # For now, always allow AI requests - implement rate limiting later
        return True
    
    def _gather_hero_data(self, user) -> dict:
        """Gather data for hero infographic."""
        habits = Habit.objects.filter(user=user, is_active=True)
        
        # Date ranges
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        # Basic stats
        active_habits = habits.count()
        
        # Completion rate
        week_checkins = Checkin.objects.filter(
            habit__user=user,
            date__gte=week_ago
        ).count()
        
        possible_checkins = active_habits * 7
        completion_rate = (week_checkins / possible_checkins * 100) if possible_checkins > 0 else 0
        
        # Longest current streak
        longest_streak = 0
        for habit in habits:
            streak = habit.get_current_streak()
            if streak > longest_streak:
                longest_streak = streak
        
        # Recent achievements (simplified)
        achievements = []
        if completion_rate >= 80:
            achievements.append("🏆 Week Champion")
        if longest_streak >= 7:
            achievements.append("🔥 Streak Master")
        if week_checkins > 0:
            achievements.append("💪 Consistent Hero")
        
        return {
            'active_habits': active_habits,
            'completion_rate': completion_rate,
            'longest_streak': longest_streak,
            'recent_achievements': achievements
        }
    
    def _calculate_user_level(self, data) -> int:
        """Calculate user level based on their progress."""
        base_level = 1
        
        # Add levels based on habits and completion
        level = base_level + (data['active_habits'] // 2)  # +1 level per 2 habits
        level += int(data['completion_rate'] // 20)  # +1 level per 20% completion
        level += (data['longest_streak'] // 7)  # +1 level per 7-day streak
        
        return min(level, 50)  # Cap at level 50


class AIInsightsView(APIView):
    """Generate AI insights for specific habits."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, habit_id):
        """Generate AI insights for a specific habit."""
        try:
            user = request.user
            
            # Check AI usage limits
            if not self._check_ai_limits(user):
                return Response({
                    'error': 'AI usage limit exceeded. Please try again later.'
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Get habit
            try:
                habit = Habit.objects.get(id=habit_id, user=user)
            except Habit.DoesNotExist:
                return Response({
                    'error': 'Habit not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Gather habit-specific data
            habit_data = self._gather_single_habit_data(habit)
            
            # Generate insights using LangGraph
            # Convert habit_data to the format expected by LangGraph
            habits_data_for_ai = {
                'total_habits': 1,
                'overall_completion_rate': habit_data['completion_rate'],
                'longest_streak': habit_data['current_streak'],
                'current_streaks': [habit_data['current_streak']]
            }
            ai_report = await langgraph_ai_service.generate_progress_report(user, habits_data_for_ai)
            insights = ai_report.get('insights', [])
            
            response = {
                'habit_id': str(habit.id),
                'habit_title': habit.title,
                'insights': insights,
                'generated_at': timezone.now().isoformat()
            }
            
            logger.info(f"Generated habit insights for user {user.email}, habit {habit.title}")
            
            return Response(response)
            
        except Exception as e:
            logger.error(f"Error generating habit insights: {str(e)}")
            return Response({
                'error': 'Failed to generate insights. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _check_ai_limits(self, user) -> bool:
        """Check if user is within AI usage limits."""
        # For now, always allow AI requests - implement rate limiting later  
        return True
    
    def _gather_single_habit_data(self, habit) -> dict:
        """Gather data for a single habit analysis."""
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Basic habit info
        current_streak = habit.get_current_streak()
        
        # Completion stats
        month_checkins = Checkin.objects.filter(
            habit=habit,
            date__gte=month_ago
        ).count()
        
        possible_checkins = 30  # Assuming daily habit
        completion_rate = (month_checkins / possible_checkins * 100) if possible_checkins > 0 else 0
        
        # Recent activity
        recent_checkins = list(
            Checkin.objects.filter(
                habit=habit,
                date__gte=week_ago
            ).values('date', 'note')[:14]
        )
        
        return {
            'title': habit.title,
            'difficulty_level': habit.difficulty_level,
            'cadence': habit.cadence,
            'current_streak': current_streak,
            'longest_streak': current_streak,  # Simplified
            'completion_rate': completion_rate,
            'recent_checkins': recent_checkins
        }