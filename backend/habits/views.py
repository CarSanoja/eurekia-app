from rest_framework import status
from rest_framework.decorators import action
from rest_framework.generics import (
    RetrieveUpdateAPIView, ListCreateAPIView, 
    RetrieveUpdateDestroyAPIView, CreateAPIView, ListAPIView
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Mission, Vision, Habit, Checkin, Mood, Trigger, EnvPledge, PlanIfThen, Badge
from .serializers import (
    MissionSerializer, VisionSerializer, HabitSerializer, 
    CheckinSerializer, MoodSerializer, TriggerSerializer,
    EnvPledgeSerializer, PlanIfThenSerializer, BadgeSerializer
)


class MissionView(RetrieveUpdateAPIView):
    serializer_class = MissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        mission, created = Mission.objects.get_or_create(user=self.request.user)
        return mission


class VisionView(RetrieveUpdateAPIView):
    serializer_class = VisionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        vision, created = Vision.objects.get_or_create(user=self.request.user)
        return vision


class HabitListCreateView(ListCreateAPIView):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user, is_active=True)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HabitDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = HabitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Habit.objects.filter(user=self.request.user)


class CheckinCreateView(CreateAPIView):
    serializer_class = CheckinSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        habit_id = self.kwargs['pk']
        habit = Habit.objects.get(id=habit_id, user=self.request.user)
        serializer.save(habit=habit)


class MoodCreateView(CreateAPIView):
    serializer_class = MoodSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class MoodHistoryView(ListAPIView):
    serializer_class = MoodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Mood.objects.filter(user=self.request.user).order_by('-date')[:30]


class TriggerListCreateView(ListCreateAPIView):
    serializer_class = TriggerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Trigger.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class EnvPledgeView(RetrieveUpdateAPIView):
    serializer_class = EnvPledgeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        pledge, created = EnvPledge.objects.get_or_create(user=self.request.user)
        return pledge


class PlanIfThenListCreateView(ListCreateAPIView):
    serializer_class = PlanIfThenSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return PlanIfThen.objects.filter(user=self.request.user, is_active=True)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class HabitInsuranceView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        """Use insurance for a habit"""
        try:
            habit = Habit.objects.get(id=pk, user=request.user)
        except Habit.DoesNotExist:
            return Response(
                {'error': 'Habit not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get date from request or use today
        date_str = request.data.get('date')
        if date_str:
            from datetime import datetime
            try:
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            date = None
        
        # Try to use insurance
        success = habit.use_insurance(date)
        
        if success:
            return Response({
                'message': 'Insurance used successfully',
                'insurance_available': habit.get_insurance_count(),
                'current_streak': habit.get_current_streak()
            })
        else:
            return Response(
                {'error': 'No insurance available'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class StreakStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        """Get detailed streak statistics for a habit"""
        try:
            habit = Habit.objects.get(id=pk, user=request.user)
        except Habit.DoesNotExist:
            return Response(
                {'error': 'Habit not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        stats = habit.get_streak_stats()
        return Response(stats)


class BadgeListView(ListAPIView):
    """List all badges earned by the user"""
    serializer_class = BadgeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Badge.objects.filter(user=self.request.user)


class BadgeStatsView(APIView):
    """Get badge statistics for the user"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        badges = Badge.objects.filter(user=request.user)
        
        stats = {
            'total_badges': badges.count(),
            'badges_by_type': {},
            'recent_badges': []
        }
        
        # Count badges by type
        for badge in badges:
            badge_type = badge.type
            if badge_type not in stats['badges_by_type']:
                stats['badges_by_type'][badge_type] = 0
            stats['badges_by_type'][badge_type] += 1
        
        # Get recent badges (last 5)
        recent_badges = badges.order_by('-awarded_at')[:5]
        stats['recent_badges'] = BadgeSerializer(recent_badges, many=True).data
        
        return Response(stats)


class ProgressStatsView(APIView):
    """Get comprehensive progress statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta
        
        user = request.user
        habits = Habit.objects.filter(user=user, is_active=True)
        
        # Calculate date ranges
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Get all checkins for calculations
        all_checkins = Checkin.objects.filter(
            habit__user=user,
            date__gte=month_ago
        )
        
        # Calculate stats
        total_habits = habits.count()
        active_streaks = sum(1 for habit in habits if habit.get_current_streak() > 0)
        total_checkins = all_checkins.filter(value=True).count()
        
        # Calculate adherence percentage (last 30 days)
        expected_checkins = total_habits * 30 if total_habits > 0 else 1
        completed_checkins = total_checkins
        adherence_percentage = min(100, (completed_checkins / expected_checkins) * 100) if expected_checkins > 0 else 0
        
        # Current week progress
        week_checkins = all_checkins.filter(date__gte=week_ago, value=True).count()
        week_expected = total_habits * 7 if total_habits > 0 else 1
        current_week_progress = min(100, (week_checkins / week_expected) * 100) if week_expected > 0 else 0
        
        # Best streak (calculate from streak stats)
        best_streak = 0
        for habit in habits:
            streak_stats = habit.get_streak_stats()
            best_streak = max(best_streak, streak_stats['longest_streak'])
        
        # Habits completed today
        today_checkins = all_checkins.filter(date=today, value=True).count()
        
        # Consistency score (average of adherence and streak maintenance)
        streak_score = (active_streaks / total_habits * 100) if total_habits > 0 else 0
        consistency_score = (adherence_percentage + streak_score) / 2
        
        stats = {
            'total_habits': total_habits,
            'active_streaks': active_streaks,
            'total_checkins': total_checkins,
            'adherence_percentage': round(adherence_percentage, 1),
            'current_week_progress': round(current_week_progress, 1),
            'best_streak': best_streak,
            'habits_completed_today': today_checkins,
            'consistency_score': round(consistency_score, 1)
        }
        
        return Response(stats)


class HabitProgressView(APIView):
    """Get detailed progress data for charts"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta
        
        user = request.user
        days = int(request.query_params.get('days', 30))
        
        # Calculate date range
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days-1)
        
        # Get habits and checkins
        habits = Habit.objects.filter(user=user, is_active=True)
        
        # Generate daily progress data
        progress_data = []
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            
            # Get checkins for this date
            day_checkins = Checkin.objects.filter(
                habit__user=user,
                date=current_date,
                value=True
            )
            
            completed = day_checkins.count()
            total = habits.count()
            completion_rate = (completed / total * 100) if total > 0 else 0
            
            progress_data.append({
                'date': current_date.isoformat(),
                'completed': completed,
                'total': total,
                'completion_rate': round(completion_rate, 1),
                'label': current_date.strftime('%b %d') if i % 7 == 0 or i == days-1 else ''
            })
        
        return Response({
            'progress_data': progress_data,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat(),
                'days': days
            }
        })


class HabitCalendarView(APIView):
    """Get habit data for calendar view"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from django.utils import timezone
        from datetime import timedelta
        
        user = request.user
        year = int(request.query_params.get('year', timezone.now().year))
        month = int(request.query_params.get('month', timezone.now().month))
        
        # Calculate month range
        from calendar import monthrange
        days_in_month = monthrange(year, month)[1]
        start_date = timezone.datetime(year, month, 1).date()
        end_date = timezone.datetime(year, month, days_in_month).date()
        
        # Get all checkins for the month
        checkins = Checkin.objects.filter(
            habit__user=user,
            date__gte=start_date,
            date__lte=end_date
        ).select_related('habit')
        
        # Group checkins by date and habit
        calendar_data = []
        habits = Habit.objects.filter(user=user, is_active=True)
        
        for checkin in checkins:
            calendar_data.append({
                'date': checkin.date.isoformat(),
                'habit_id': str(checkin.habit.id),
                'name': checkin.habit.title,
                'completed': checkin.value
            })
        
        return Response({
            'calendar_data': calendar_data,
            'month_info': {
                'year': year,
                'month': month,
                'days_in_month': days_in_month,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'habits': [{'id': str(h.id), 'name': h.title} for h in habits]
        })