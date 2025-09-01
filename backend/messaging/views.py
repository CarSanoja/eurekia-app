from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, CreateAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from .models import OutboundMessage, InboundMessage, ConsentLog
from .tasks import send_habit_reminder, send_achievement_notification
from accounts.models import ContactMethod, ChannelPreference
from accounts.serializers import ContactMethodSerializer
from .serializers import OutboundMessageSerializer, ChannelPreferenceSerializer


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Send a message via specified channel"""
        template_key = request.data.get('template', 'test_notification')
        channel = request.data.get('channel', 'email')
        payload = request.data.get('payload', {})
        
        try:
            # For now, we'll focus on email notifications
            if channel == 'email' and template_key == 'test_notification':
                # Send test notification
                from .email_service import EmailService
                success = EmailService.send_achievement_notification(
                    request.user, 'first_habit', {'test': True}
                )
                
                # Log the message
                outbound_message = OutboundMessage.objects.create(
                    user=request.user,
                    channel=channel,
                    template_key=template_key,
                    payload_json=payload,
                    status='sent' if success else 'failed',
                    sent_at=timezone.now() if success else None
                )
                
                return Response({
                    'status': 'Message sent successfully' if success else 'Failed to send message',
                    'success': success,
                    'message_id': str(outbound_message.id)
                })
            
            # Queue other message types
            outbound_message = OutboundMessage.objects.create(
                user=request.user,
                channel=channel,
                template_key=template_key,
                payload_json=payload,
                status='queued'
            )
            
            return Response({
                'status': 'Message queued for delivery',
                'message_id': str(outbound_message.id)
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OutboundMessageListView(ListAPIView):
    serializer_class = OutboundMessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return OutboundMessage.objects.filter(user=self.request.user).order_by('-created_at')[:50]


class ContactMethodCreateView(CreateAPIView):
    serializer_class = ContactMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ContactMethodUpdateView(UpdateAPIView):
    serializer_class = ContactMethodSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ContactMethod.objects.filter(user=self.request.user)


class ChannelPreferencesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's channel preferences"""
        try:
            preferences = ChannelPreference.objects.filter(user=request.user)
            data = []
            
            # Default channels if none exist
            default_channels = ['email', 'web']
            
            for channel in default_channels:
                try:
                    pref = preferences.get(channel=channel)
                    data.append({
                        'channel': channel,
                        'primary': pref.primary,
                        'allow_prompts': pref.allow_prompts,
                        'quiet_hours': pref.quiet_hours
                    })
                except ChannelPreference.DoesNotExist:
                    # Create default preferences
                    pref = ChannelPreference.objects.create(
                        user=request.user,
                        channel=channel,
                        primary=channel == 'email',
                        allow_prompts=True,
                        quiet_hours='22:00-08:00'
                    )
                    data.append({
                        'channel': channel,
                        'primary': pref.primary,
                        'allow_prompts': pref.allow_prompts,
                        'quiet_hours': pref.quiet_hours
                    })
            
            return Response(data)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request):
        """Update user's channel preferences"""
        try:
            preferences_data = request.data
            
            for pref_data in preferences_data:
                channel = pref_data.get('channel')
                if not channel:
                    continue
                
                pref, created = ChannelPreference.objects.get_or_create(
                    user=request.user,
                    channel=channel
                )
                
                pref.primary = pref_data.get('primary', pref.primary)
                pref.allow_prompts = pref_data.get('allow_prompts', pref.allow_prompts)
                pref.quiet_hours = pref_data.get('quiet_hours', pref.quiet_hours)
                pref.save()
            
            return Response({'status': 'Preferences updated successfully'})
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TriggerHabitReminderView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, habit_id):
        """Trigger a habit reminder for testing"""
        try:
            from habits.models import Habit
            habit = Habit.objects.get(id=habit_id, user=request.user)
            
            # Send immediate reminder
            send_habit_reminder.delay(str(habit.id), str(request.user.id))
            
            return Response({'status': 'Reminder scheduled'})
            
        except Habit.DoesNotExist:
            return Response(
                {'error': 'Habit not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class NotificationStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get notification statistics for user"""
        try:
            user_messages = OutboundMessage.objects.filter(user=request.user)
            
            stats = {
                'total_sent': user_messages.filter(status='sent').count(),
                'total_failed': user_messages.filter(status='failed').count(),
                'total_queued': user_messages.filter(status='queued').count(),
                'last_30_days': user_messages.filter(
                    created_at__gte=timezone.now() - timezone.timedelta(days=30)
                ).count(),
                'by_template': {}
            }
            
            # Get counts by template type
            templates = user_messages.values_list('template_key', flat=True).distinct()
            for template in templates:
                stats['by_template'][template] = user_messages.filter(template_key=template).count()
            
            return Response(stats)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )