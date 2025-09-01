#!/bin/bash

# EC2 Backend Fix Script - Run this on your EC2 instance
# SSH command: ssh -i your-key.pem ec2-user@23.22.233.226 'bash -s' < fix-ec2-backend.sh

echo "🚀 Starting Eurekia Backend Fix..."

# Update system
sudo yum update -y

# Install Docker and Docker Compose if not installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -a -G docker ec2-user
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install Nginx for HTTPS
sudo yum install -y nginx openssl

# Create app directory
sudo mkdir -p /app
sudo chown ec2-user:ec2-user /app
cd /app

# Clone or update repository
if [ ! -d ".git" ]; then
    echo "Cloning repository..."
    git clone https://github.com/CarSanoja/eurekia-app.git .
else
    echo "Updating repository..."
    git pull origin main
fi

# Create production environment file
cat > /app/.env << 'EOL'
DJANGO_SETTINGS_MODULE=quanta.settings.production
SECRET_KEY=eurekia-ec2-production-super-secret-key-2024
DEBUG=False
ALLOWED_HOSTS=23.22.233.226,eurekia-alb-1943853017.us-east-1.elb.amazonaws.com
CORS_ALLOWED_ORIGINS=https://frontend-a8bv01msn-carlos-projects-ca28303e.vercel.app,https://frontend-2ye2q28bb-carlos-projects-ca28303e.vercel.app
EMAIL_HOST_USER=wuopcarlos@gmail.com
EMAIL_HOST_PASSWORD=ndhnnlamyacspths
GOOGLE_API_KEY=
DATABASE_URL=postgresql://eurekia_user:eurekia_pass@db:5432/eurekia_db
REDIS_URL=redis://redis:6379/0
EOL

# Create Docker Compose file
cat > /app/docker-compose.yml << 'EOL'
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
      - "8000:8000"
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

volumes:
  postgres_data:
EOL

# Generate self-signed SSL certificate
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/eurekia.key \
    -out /etc/nginx/ssl/eurekia.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=23.22.233.226"

# Configure Nginx as reverse proxy with SSL
sudo tee /etc/nginx/nginx.conf << 'EOL'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile            on;
    tcp_nopush          on;
    tcp_nodelay         on;
    keepalive_timeout   65;
    types_hash_max_size 2048;

    include             /etc/nginx/mime.types;
    default_type        application/octet-stream;

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl;
        server_name _;

        ssl_certificate /etc/nginx/ssl/eurekia.crt;
        ssl_certificate_key /etc/nginx/ssl/eurekia.key;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://frontend-a8bv01msn-carlos-projects-ca28303e.vercel.app' always;
        add_header 'Access-Control-Allow-Origin' 'https://frontend-2ye2q28bb-carlos-projects-ca28303e.vercel.app' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
        add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://frontend-a8bv01msn-carlos-projects-ca28303e.vercel.app' always;
            add_header 'Access-Control-Allow-Origin' 'https://frontend-2ye2q28bb-carlos-projects-ca28303e.vercel.app' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000 always;
            add_header 'Content-Type' 'text/plain; charset=utf-8' always;
            add_header 'Content-Length' 0 always;
            return 204;
        }

        # Proxy to Django backend
        location / {
            proxy_pass http://localhost:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOL

# Start services
echo "🔥 Starting backend services..."
sudo docker-compose down 2>/dev/null || true
sudo docker-compose up -d --build

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Test services
echo "🧪 Testing services..."
curl -k https://localhost/api/health/ || echo "Service not ready yet..."

echo "✅ Setup complete!"
echo ""
echo "🌐 Your backend is now available at:"
echo "   HTTPS: https://23.22.233.226"
echo "   Health: https://23.22.233.226/api/health/"
echo "   Admin: https://23.22.233.226/admin/"
echo ""
echo "⚠️  Note: Using self-signed certificate - browser will show security warning"
echo "   Click 'Advanced' -> 'Proceed to 23.22.233.226 (unsafe)' to accept"
echo ""
echo "🔗 Update Vercel with: https://23.22.233.226/api"