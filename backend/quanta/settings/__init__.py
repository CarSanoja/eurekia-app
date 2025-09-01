"""
Settings module for Eurekia Quanta backend

Automatically selects the appropriate settings file based on environment.
"""
import os

# Determine which settings to use based on environment
ENVIRONMENT = os.environ.get('DJANGO_SETTINGS_MODULE', '').split('.')[-1]

if ENVIRONMENT == 'production':
    from .production import *
elif ENVIRONMENT == 'development':
    from .development import *
else:
    # Default to development settings
    from .development import *