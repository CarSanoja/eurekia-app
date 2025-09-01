from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

logger = logging.getLogger(__name__)

channel_layer = get_channel_layer()


def send_dashboard_update(update_type='general', data=None):
    """Send real-time update to admin dashboard"""
    try:
        async_to_sync(channel_layer.group_send)(
            'admin_dashboard',
            {
                'type': 'dashboard_update',
                'data': {
                    'update_type': update_type,
                    'data': data or {}
                }
            }
        )
        logger.info(f"Sent dashboard update: {update_type}")
    except Exception as e:
        logger.error(f"Error sending dashboard update: {str(e)}")


def send_user_notification(user_id, notification_type, data):
    """Send real-time notification to specific user"""
    try:
        async_to_sync(channel_layer.group_send)(
            f'user_{user_id}',
            {
                'type': 'notification',
                'data': {
                    'notification_type': notification_type,
                    **data
                }
            }
        )
        logger.info(f"Sent notification to user {user_id}: {notification_type}")
    except Exception as e:
        logger.error(f"Error sending notification: {str(e)}")


def send_badge_unlock(user_id, badge_data):
    """Send badge unlock notification"""
    try:
        async_to_sync(channel_layer.group_send)(
            f'user_{user_id}',
            {
                'type': 'badge_unlock',
                'badge': badge_data
            }
        )
        logger.info(f"Sent badge unlock notification to user {user_id}")
    except Exception as e:
        logger.error(f"Error sending badge unlock: {str(e)}")


def send_streak_update(user_id, habit_name, streak_count):
    """Send streak update notification"""
    try:
        async_to_sync(channel_layer.group_send)(
            f'user_{user_id}',
            {
                'type': 'streak_update',
                'habit': habit_name,
                'streak': streak_count
            }
        )
        logger.info(f"Sent streak update to user {user_id}: {habit_name} - {streak_count}")
    except Exception as e:
        logger.error(f"Error sending streak update: {str(e)}")


def send_achievement(user_id, title, description):
    """Send achievement notification"""
    try:
        async_to_sync(channel_layer.group_send)(
            f'user_{user_id}',
            {
                'type': 'achievement',
                'title': title,
                'description': description
            }
        )
        logger.info(f"Sent achievement to user {user_id}: {title}")
    except Exception as e:
        logger.error(f"Error sending achievement: {str(e)}")


def broadcast_system_message(message, level='info'):
    """Broadcast system message to all admin users"""
    try:
        async_to_sync(channel_layer.group_send)(
            'admin_dashboard',
            {
                'type': 'dashboard_update',
                'data': {
                    'update_type': 'system_message',
                    'message': message,
                    'level': level
                }
            }
        )
        logger.info(f"Broadcast system message: {message}")
    except Exception as e:
        logger.error(f"Error broadcasting system message: {str(e)}")