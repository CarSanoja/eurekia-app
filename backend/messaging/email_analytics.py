"""
Email Analytics System for tracking email performance and user engagement
"""
import uuid
import logging
import re
from datetime import datetime, timedelta
from django.utils import timezone
from django.db import models
from django.core.cache import cache

logger = logging.getLogger(__name__)


class EmailAnalyticsModel(models.Model):
    """Model to track email analytics"""
    
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('opened', 'Opened'),
        ('clicked', 'Clicked'),
        ('bounced', 'Bounced'),
        ('unsubscribed', 'Unsubscribed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    tracking_id = models.CharField(max_length=255, unique=True, db_index=True)
    user = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='email_analytics')
    template_key = models.CharField(max_length=100)
    message_id = models.CharField(max_length=255, blank=True)
    
    # Timestamps
    sent_at = models.DateTimeField(auto_now_add=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    first_clicked_at = models.DateTimeField(null=True, blank=True)
    
    # Analytics data
    open_count = models.IntegerField(default=0)
    click_count = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='sent')
    
    # Device and location info
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    device_type = models.CharField(max_length=50, blank=True)
    
    # Additional metadata
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'email_analytics'
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['user', 'template_key']),
            models.Index(fields=['tracking_id']),
            models.Index(fields=['sent_at']),
        ]
    
    def __str__(self):
        return f"{self.user.email} - {self.template_key} - {self.status}"


class EmailClickModel(models.Model):
    """Model to track individual email clicks"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    analytics = models.ForeignKey(EmailAnalyticsModel, on_delete=models.CASCADE, related_name='clicks')
    url = models.URLField()
    clicked_at = models.DateTimeField(auto_now_add=True)
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        db_table = 'email_clicks'
        ordering = ['-clicked_at']


class EmailAnalytics:
    """Service for handling email analytics and tracking"""
    
    @staticmethod
    def generate_tracking_id():
        """Generate unique tracking ID for email"""
        return str(uuid.uuid4())
    
    @staticmethod
    def log_email_sent(user, template_key, tracking_id, message_id=None):
        """Log email send event"""
        try:
            analytics, created = EmailAnalyticsModel.objects.get_or_create(
                tracking_id=tracking_id,
                defaults={
                    'user': user,
                    'template_key': template_key,
                    'message_id': message_id or '',
                    'status': 'sent'
                }
            )
            
            if created:
                logger.info(f"Email analytics logged: {tracking_id} for {user.email}")
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error logging email sent: {str(e)}")
            return None
    
    @staticmethod
    def log_email_opened(tracking_id, user_agent=None, ip_address=None):
        """Log email open event"""
        try:
            analytics = EmailAnalyticsModel.objects.get(tracking_id=tracking_id)
            
            # Update open count and timestamp
            analytics.open_count += 1
            if not analytics.opened_at:
                analytics.opened_at = timezone.now()
                analytics.status = 'opened'
            
            # Update device info
            if user_agent:
                analytics.user_agent = user_agent
                analytics.device_type = EmailAnalytics.parse_device_type(user_agent)
            
            if ip_address:
                analytics.ip_address = ip_address
            
            analytics.save()
            
            logger.info(f"Email opened: {tracking_id} (total opens: {analytics.open_count})")
            return True
            
        except EmailAnalyticsModel.DoesNotExist:
            logger.warning(f"Analytics record not found for tracking_id: {tracking_id}")
            return False
            
        except Exception as e:
            logger.error(f"Error logging email open: {str(e)}")
            return False
    
    @staticmethod
    def log_email_clicked(tracking_id, url, user_agent=None, ip_address=None):
        """Log email click event"""
        try:
            analytics = EmailAnalyticsModel.objects.get(tracking_id=tracking_id)
            
            # Update click count and timestamp
            analytics.click_count += 1
            if not analytics.first_clicked_at:
                analytics.first_clicked_at = timezone.now()
                analytics.status = 'clicked'
            
            analytics.save()
            
            # Log individual click
            EmailClickModel.objects.create(
                analytics=analytics,
                url=url,
                user_agent=user_agent or '',
                ip_address=ip_address
            )
            
            logger.info(f"Email clicked: {tracking_id} - {url}")
            return True
            
        except EmailAnalyticsModel.DoesNotExist:
            logger.warning(f"Analytics record not found for tracking_id: {tracking_id}")
            return False
            
        except Exception as e:
            logger.error(f"Error logging email click: {str(e)}")
            return False
    
    @staticmethod
    def add_click_tracking(html_content, tracking_id):
        """Add click tracking to all links in HTML content"""
        try:
            # Find all links and replace with tracking URLs
            def replace_link(match):
                full_match = match.group(0)
                url = match.group(1)
                
                # Skip already tracked URLs and tracking pixels
                if 'track/click' in url or 'track/open' in url:
                    return full_match
                
                # Create tracked URL
                tracked_url = f'https://quanta.app/api/email/track/click/{tracking_id}?url={url}'
                
                # Replace the href attribute
                return full_match.replace(f'href="{url}"', f'href="{tracked_url}"')
            
            # Pattern to match href attributes
            link_pattern = r'href="([^"]+)"'
            tracked_html = re.sub(link_pattern, replace_link, html_content)
            
            return tracked_html
            
        except Exception as e:
            logger.error(f"Error adding click tracking: {str(e)}")
            return html_content
    
    @staticmethod
    def parse_device_type(user_agent):
        """Parse device type from user agent string"""
        if not user_agent:
            return 'unknown'
        
        user_agent = user_agent.lower()
        
        if 'mobile' in user_agent or 'android' in user_agent:
            return 'mobile'
        elif 'tablet' in user_agent or 'ipad' in user_agent:
            return 'tablet'
        elif 'desktop' in user_agent or 'windows' in user_agent or 'macintosh' in user_agent:
            return 'desktop'
        else:
            return 'unknown'
    
    @staticmethod
    def get_email_performance_stats(template_key=None, days=30):
        """Get email performance statistics"""
        try:
            # Date filter
            since_date = timezone.now() - timedelta(days=days)
            
            # Base queryset
            queryset = EmailAnalyticsModel.objects.filter(sent_at__gte=since_date)
            
            if template_key:
                queryset = queryset.filter(template_key=template_key)
            
            # Calculate stats
            total_sent = queryset.count()
            total_opened = queryset.filter(opened_at__isnull=False).count()
            total_clicked = queryset.filter(first_clicked_at__isnull=False).count()
            
            # Calculate rates
            open_rate = (total_opened / total_sent * 100) if total_sent > 0 else 0
            click_rate = (total_clicked / total_sent * 100) if total_sent > 0 else 0
            click_through_rate = (total_clicked / total_opened * 100) if total_opened > 0 else 0
            
            stats = {
                'total_sent': total_sent,
                'total_opened': total_opened,
                'total_clicked': total_clicked,
                'open_rate': round(open_rate, 2),
                'click_rate': round(click_rate, 2),
                'click_through_rate': round(click_through_rate, 2),
                'period_days': days
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting email performance stats: {str(e)}")
            return {}
    
    @staticmethod
    def get_template_performance(days=30):
        """Get performance stats by template"""
        try:
            since_date = timezone.now() - timedelta(days=days)
            
            templates = EmailAnalyticsModel.objects.filter(
                sent_at__gte=since_date
            ).values('template_key').distinct()
            
            template_stats = []
            
            for template in templates:
                template_key = template['template_key']
                stats = EmailAnalytics.get_email_performance_stats(template_key, days)
                stats['template_key'] = template_key
                template_stats.append(stats)
            
            # Sort by open rate
            template_stats.sort(key=lambda x: x.get('open_rate', 0), reverse=True)
            
            return template_stats
            
        except Exception as e:
            logger.error(f"Error getting template performance: {str(e)}")
            return []
    
    @staticmethod
    def get_user_engagement_score(user, days=30):
        """Calculate user engagement score based on email interactions"""
        try:
            since_date = timezone.now() - timedelta(days=days)
            
            analytics = EmailAnalyticsModel.objects.filter(
                user=user,
                sent_at__gte=since_date
            )
            
            if not analytics.exists():
                return 0
            
            total_sent = analytics.count()
            total_opens = sum(a.open_count for a in analytics)
            total_clicks = sum(a.click_count for a in analytics)
            
            # Calculate engagement score (0-100)
            open_score = min(total_opens / total_sent * 50, 50) if total_sent > 0 else 0
            click_score = min(total_clicks / total_sent * 50, 50) if total_sent > 0 else 0
            
            engagement_score = open_score + click_score
            
            return round(engagement_score, 1)
            
        except Exception as e:
            logger.error(f"Error calculating engagement score: {str(e)}")
            return 0
    
    @staticmethod
    def get_best_send_times(user=None, days=90):
        """Analyze best times to send emails based on open rates"""
        try:
            since_date = timezone.now() - timedelta(days=days)
            
            queryset = EmailAnalyticsModel.objects.filter(sent_at__gte=since_date)
            
            if user:
                queryset = queryset.filter(user=user)
            
            # Group by hour of day
            hourly_stats = {}
            
            for analytics in queryset:
                hour = analytics.sent_at.hour
                
                if hour not in hourly_stats:
                    hourly_stats[hour] = {'sent': 0, 'opened': 0}
                
                hourly_stats[hour]['sent'] += 1
                if analytics.opened_at:
                    hourly_stats[hour]['opened'] += 1
            
            # Calculate open rates by hour
            hourly_rates = []
            for hour, stats in hourly_stats.items():
                if stats['sent'] >= 5:  # Minimum sample size
                    open_rate = (stats['opened'] / stats['sent']) * 100
                    hourly_rates.append({
                        'hour': hour,
                        'open_rate': round(open_rate, 2),
                        'sample_size': stats['sent']
                    })
            
            # Sort by open rate
            hourly_rates.sort(key=lambda x: x['open_rate'], reverse=True)
            
            return hourly_rates[:5]  # Top 5 hours
            
        except Exception as e:
            logger.error(f"Error analyzing best send times: {str(e)}")
            return []
    
    @staticmethod
    def cleanup_old_analytics(days=180):
        """Clean up old analytics data"""
        try:
            cutoff_date = timezone.now() - timedelta(days=days)
            
            # Delete old analytics records
            deleted_analytics = EmailAnalyticsModel.objects.filter(
                sent_at__lt=cutoff_date
            ).delete()[0]
            
            # Delete old click records
            deleted_clicks = EmailClickModel.objects.filter(
                clicked_at__lt=cutoff_date
            ).delete()[0]
            
            logger.info(f"Cleaned up {deleted_analytics} analytics records and {deleted_clicks} click records")
            
            return {
                'analytics_deleted': deleted_analytics,
                'clicks_deleted': deleted_clicks
            }
            
        except Exception as e:
            logger.error(f"Error cleaning up analytics: {str(e)}")
            return {'analytics_deleted': 0, 'clicks_deleted': 0}
    
    @staticmethod
    def get_unsubscribe_rate(template_key=None, days=30):
        """Calculate unsubscribe rate for emails"""
        try:
            since_date = timezone.now() - timedelta(days=days)
            
            queryset = EmailAnalyticsModel.objects.filter(sent_at__gte=since_date)
            
            if template_key:
                queryset = queryset.filter(template_key=template_key)
            
            total_sent = queryset.count()
            unsubscribed = queryset.filter(status='unsubscribed').count()
            
            unsubscribe_rate = (unsubscribed / total_sent * 100) if total_sent > 0 else 0
            
            return {
                'total_sent': total_sent,
                'unsubscribed': unsubscribed,
                'unsubscribe_rate': round(unsubscribe_rate, 2)
            }
            
        except Exception as e:
            logger.error(f"Error calculating unsubscribe rate: {str(e)}")
            return {'total_sent': 0, 'unsubscribed': 0, 'unsubscribe_rate': 0}
    
    @staticmethod
    def cache_analytics_data(key, data, timeout=3600):
        """Cache analytics data for performance"""
        try:
            cache.set(f'email_analytics:{key}', data, timeout)
            return True
        except Exception as e:
            logger.error(f"Error caching analytics data: {str(e)}")
            return False
    
    @staticmethod
    def get_cached_analytics_data(key):
        """Get cached analytics data"""
        try:
            return cache.get(f'email_analytics:{key}')
        except Exception as e:
            logger.error(f"Error getting cached analytics data: {str(e)}")
            return None