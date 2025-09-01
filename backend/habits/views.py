from rest_framework import status
from rest_framework.decorators import action
from rest_framework.generics import (
    RetrieveUpdateAPIView, ListCreateAPIView, 
    RetrieveUpdateDestroyAPIView, CreateAPIView, ListAPIView
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Mission, Vision, Habit, Checkin, Mood, Trigger, EnvPledge, PlanIfThen
from .serializers import (
    MissionSerializer, VisionSerializer, HabitSerializer, 
    CheckinSerializer, MoodSerializer, TriggerSerializer,
    EnvPledgeSerializer, PlanIfThenSerializer
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