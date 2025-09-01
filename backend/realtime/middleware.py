from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from accounts.models import User
import logging

logger = logging.getLogger(__name__)


class JWTAuthMiddleware:
    """JWT authentication middleware for WebSocket connections"""
    
    def __init__(self, inner):
        self.inner = inner
    
    async def __call__(self, scope, receive, send):
        # Get token from query string
        query_string = scope.get('query_string', b'').decode()
        token = None
        
        # Parse token from query string
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=')[1]
                break
        
        if token:
            try:
                # Validate token and get user
                access_token = AccessToken(token)
                user = await self.get_user(access_token['user_id'])
                scope['user'] = user
            except Exception as e:
                logger.error(f"JWT authentication failed: {str(e)}")
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()
        
        return await self.inner(scope, receive, send)
    
    @database_sync_to_async
    def get_user(self, user_id):
        """Get user from database"""
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()


def JWTAuthMiddlewareStack(inner):
    """Convenience function to apply JWT auth middleware"""
    return JWTAuthMiddleware(AuthMiddlewareStack(inner))