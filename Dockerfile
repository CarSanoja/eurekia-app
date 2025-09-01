# Railway Dockerfile - Points to backend directory
# This fixes Railway not detecting the correct directory structure

# Use the production Dockerfile from backend directory
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        curl \
        && rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install additional production dependencies
RUN pip install --no-cache-dir \
    gunicorn==21.2.0 \
    whitenoise==6.6.0 \
    dj-database-url==2.1.0 \
    psycopg2-binary==2.9.9 \
    django-redis==5.4.0

# Copy project
COPY backend/ .

# Create directories for static and media files
RUN mkdir -p /app/staticfiles /app/media

# Set Django settings module for production
ENV DJANGO_SETTINGS_MODULE=quanta.settings.production

# Collect static files
RUN python manage.py collectstatic --noinput --clear

# Create non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/health/ || exit 1

# Start command for Railway
CMD ["sh", "-c", "python manage.py migrate && gunicorn --bind 0.0.0.0:8000 --workers 2 --threads 4 --worker-class gthread quanta.wsgi:application"]