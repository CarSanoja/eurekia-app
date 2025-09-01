#!/bin/bash

# EC2 User Data Script for Eurekia Backend Deployment
# This script runs on instance boot to set up Docker and deploy the application

# Update system
sudo yum update -y

# Install Docker
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install -y git

# Create app directory
sudo mkdir -p /app
sudo chown ec2-user:ec2-user /app
cd /app

# Clone repository (will be updated with actual deployment)
git clone https://github.com/CarSanoja/eurekia-app.git .

# Create production environment file
cat > /app/.env << EOL
DJANGO_SETTINGS_MODULE=quanta.settings.production
SECRET_KEY=eurekia-ec2-production-super-secret-key-2024
DEBUG=False
ALLOWED_HOSTS=*
CORS_ALLOWED_ORIGINS=https://frontend-nev45x4la-carlos-projects-ca28303e.vercel.app
EMAIL_HOST_USER=wuopcarlos@gmail.com
EMAIL_HOST_PASSWORD=ndhnnlamyacspths
GOOGLE_API_KEY=
DATABASE_URL=postgresql://eurekia_user:eurekia_pass@db:5432/eurekia_db
REDIS_URL=redis://redis:6379/0
EOL

# Create docker-compose production file
cat > /app/docker-compose.prod.yml << 'EOL'
version: '3.8'

services:
  db:
    image: pgvector/pgvector:pg15
    environment:
      - POSTGRES_DB=eurekia_db
      - POSTGRES_USER=eurekia_user
      - POSTGRES_PASSWORD=eurekia_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U eurekia_user"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    env_file:
      - .env
    ports:
      - "80:8000"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  celery:
    build:
      context: .
      dockerfile: Dockerfile
    env_file:
      - .env
    command: celery -A quanta worker -l info
    depends_on:
      - db
      - redis
    restart: unless-stopped

volumes:
  postgres_data:
EOL

# Build and start services
sudo docker-compose -f docker-compose.prod.yml up -d --build

# Create startup script for automatic deployment updates
cat > /home/ec2-user/deploy.sh << 'EOL'
#!/bin/bash
cd /app
sudo git pull origin main
sudo docker-compose -f docker-compose.prod.yml down
sudo docker-compose -f docker-compose.prod.yml up -d --build
echo "Deployment updated successfully"
EOL

chmod +x /home/ec2-user/deploy.sh

# Log deployment completion
echo "Eurekia backend deployment completed at $(date)" >> /var/log/eurekia-deploy.log