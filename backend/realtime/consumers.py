import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from datetime import timedelta

from accounts.models import User
from habits.models import Habit, Checkin, Badge
from django.db.models import Count, Avg, Q

logger = logging.getLogger(__name__)


class DashboardConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time dashboard updates"""
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope['user']
        
        # Check if user is authenticated
        if not self.user.is_authenticated:
            await self.close()
            return
            
        # Check if user is admin
        is_admin = await self.is_admin_user()
        if not is_admin:
            await self.close()
            return
            
        # Join dashboard group
        self.dashboard_group = 'admin_dashboard'
        await self.channel_layer.group_add(
            self.dashboard_group,
            self.channel_name
        )
        
        await self.accept()
        
        # Send initial dashboard data
        await self.send_dashboard_update()
        
        logger.info(f"Admin user {self.user.email} connected to dashboard WebSocket")
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'dashboard_group'):
            await self.channel_layer.group_discard(
                self.dashboard_group,
                self.channel_name
            )
        logger.info(f"User disconnected from dashboard WebSocket: {close_code}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
            elif message_type == 'refresh':
                await self.send_dashboard_update()
            elif message_type == 'get_stats':
                stat_type = data.get('stat_type', 'all')
                await self.send_specific_stats(stat_type)
                
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {text_data}")
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {str(e)}")
    
    async def dashboard_update(self, event):
        """Send dashboard update to WebSocket client"""
        await self.send(text_data=json.dumps(event['data']))
    
    async def send_dashboard_update(self):
        """Send comprehensive dashboard update"""
        stats = await self.get_dashboard_stats()
        await self.send(text_data=json.dumps({
            'type': 'dashboard_update',
            'data': stats,
            'timestamp': timezone.now().isoformat()
        }))
    
    async def send_specific_stats(self, stat_type):
        """Send specific statistics based on request"""
        if stat_type == 'users':
            stats = await self.get_user_stats()
        elif stat_type == 'habits':
            stats = await self.get_habit_stats()
        elif stat_type == 'activity':
            stats = await self.get_activity_stats()
        else:
            stats = await self.get_dashboard_stats()
            
        await self.send(text_data=json.dumps({
            'type': f'{stat_type}_stats',
            'data': stats,
            'timestamp': timezone.now().isoformat()
        }))
    
    @database_sync_to_async
    def is_admin_user(self):
        """Check if user is admin"""
        return self.user.is_staff or self.user.email.endswith('@eurekia.com')
    
    @database_sync_to_async
    def get_dashboard_stats(self):
        """Get comprehensive dashboard statistics"""
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        # User stats
        total_users = User.objects.count()
        active_users_week = User.objects.filter(last_login__gte=week_ago).count()
        new_users_week = User.objects.filter(date_joined__gte=week_ago).count()
        
        # Habit stats
        total_habits = Habit.objects.filter(is_active=True).count()
        habits_created_today = Habit.objects.filter(created_at__date=today).count()
        
        # Checkin stats
        checkins_today = Checkin.objects.filter(date=today).count()
        completed_today = Checkin.objects.filter(date=today, value=True).count()
        completion_rate = (completed_today / checkins_today * 100) if checkins_today > 0 else 0
        
        # Badge stats
        badges_awarded_today = Badge.objects.filter(awarded_at__date=today).count()
        
        return {
            'users': {
                'total': total_users,
                'active_week': active_users_week,
                'new_week': new_users_week
            },
            'habits': {
                'total': total_habits,
                'created_today': habits_created_today
            },
            'checkins': {
                'today': checkins_today,
                'completed_today': completed_today,
                'completion_rate': round(completion_rate, 1)
            },
            'badges': {
                'awarded_today': badges_awarded_today
            }
        }
    
    @database_sync_to_async
    def get_user_stats(self):
        """Get user-specific statistics"""
        today = timezone.now().date()
        hour_ago = timezone.now() - timedelta(hours=1)
        
        return {
            'online_now': User.objects.filter(last_login__gte=hour_ago).count(),
            'registered_today': User.objects.filter(date_joined__date=today).count(),
            'with_habits': User.objects.filter(habits__isnull=False).distinct().count(),
            'with_checkins': User.objects.filter(habits__checkins__isnull=False).distinct().count()
        }
    
    @database_sync_to_async
    def get_habit_stats(self):
        """Get habit-specific statistics"""
        return {
            'by_difficulty': list(
                Habit.objects.filter(is_active=True)
                .values('difficulty_level')
                .annotate(count=Count('id'))
            ),
            'with_streaks': Habit.objects.filter(
                checkins__date=timezone.now().date(),
                checkins__value=True
            ).distinct().count()
        }
    
    @database_sync_to_async
    def get_activity_stats(self):
        """Get recent activity statistics"""
        last_hour = timezone.now() - timedelta(hours=1)
        last_10_minutes = timezone.now() - timedelta(minutes=10)
        
        return {
            'checkins_last_hour': Checkin.objects.filter(created_at__gte=last_hour).count(),
            'users_active_10min': User.objects.filter(last_login__gte=last_10_minutes).count(),
            'badges_last_hour': Badge.objects.filter(awarded_at__gte=last_hour).count()
        }


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time notifications"""
    
    async def connect(self):
        """Handle WebSocket connection for notifications"""
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
            
        # Join user-specific notification group
        self.user_group = f'user_{self.user.id}'
        await self.channel_layer.group_add(
            self.user_group,
            self.channel_name
        )
        
        await self.accept()
        
        logger.info(f"User {self.user.email} connected to notifications WebSocket")
    
    async def disconnect(self, close_code):
        """Handle disconnection"""
        if hasattr(self, 'user_group'):
            await self.channel_layer.group_discard(
                self.user_group,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Handle incoming messages"""
        try:
            data = json.loads(text_data)
            if data.get('type') == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
        except:
            pass
    
    async def notification(self, event):
        """Send notification to client"""
        await self.send(text_data=json.dumps(event['data']))
    
    async def badge_unlock(self, event):
        """Send badge unlock notification"""
        await self.send(text_data=json.dumps({
            'type': 'badge_unlock',
            'badge': event['badge'],
            'timestamp': timezone.now().isoformat()
        }))
    
    async def streak_update(self, event):
        """Send streak update notification"""
        await self.send(text_data=json.dumps({
            'type': 'streak_update',
            'habit': event['habit'],
            'streak': event['streak'],
            'timestamp': timezone.now().isoformat()
        }))
    
    async def achievement(self, event):
        """Send achievement notification"""
        await self.send(text_data=json.dumps({
            'type': 'achievement',
            'title': event['title'],
            'description': event['description'],
            'timestamp': timezone.now().isoformat()
        }))