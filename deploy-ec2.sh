#!/bin/bash

# Deploy script for EC2 - Execute this on your EC2 instance
# Usage: ssh -i your-key.pem ec2-user@23.22.233.226 'bash -s' < deploy-ec2.sh

echo "🚀 Deploying Eurekia Backend on EC2..."

# Pull latest changes
echo "📥 Pulling latest changes..."
cd /app
git pull origin main

# Update nginx config for port 8001
echo "🔧 Updating nginx config for port 8001..."
sudo sed -i 's/localhost:8000/localhost:8001/g' /etc/nginx/nginx.conf

# Stop current containers
echo "🛑 Stopping current containers..."
docker-compose down 2>/dev/null || true

# Deploy with fixed docker-compose
echo "🐳 Deploying with docker-compose..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Restart nginx
echo "🔄 Restarting nginx..."
sudo systemctl restart nginx
sudo systemctl status nginx

# Test backend
echo "🧪 Testing backend..."
sleep 10
curl -k https://localhost/api/health/ || echo "Backend not ready yet..."

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your backend is now available at:"
echo "   HTTPS: https://23.22.233.226"
echo "   Health: https://23.22.233.226/api/health/"
echo "   Admin: https://23.22.233.226/admin/"
echo ""
echo "🔗 Update Vercel with: https://23.22.233.226/api"