#!/bin/bash

# Eurekia Automated Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 Starting Eurekia deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required CLIs are installed
print_status "Checking required tools..."

if ! command -v railway &> /dev/null; then
    print_warning "Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

print_success "All tools are available"

# Deploy to Railway
print_status "Deploying backend to Railway..."
cd backend

# Check if Railway is initialized
if [ ! -f "railway.json" ]; then
    print_status "Initializing Railway project..."
    railway login
    railway init
fi

# Deploy to Railway
print_status "Pushing to Railway..."
railway up --detach

# Get Railway URL
RAILWAY_URL=$(railway status --json | jq -r '.deployments[0].url')
print_success "Backend deployed to: $RAILWAY_URL"

# Go back to root
cd ..

# Deploy to Vercel
print_status "Deploying frontend to Vercel..."
cd frontend

# Check if Vercel is initialized
if [ ! -f ".vercel/project.json" ]; then
    print_status "Initializing Vercel project..."
    vercel login
    vercel init
fi

# Set environment variables for build
export VITE_API_URL="${RAILWAY_URL}/api"
export VITE_WS_URL="${RAILWAY_URL/https/wss}/ws"
export NODE_ENV=production

# Build and deploy
print_status "Building and deploying frontend..."
vercel --prod --yes

# Get Vercel URL
VERCEL_URL=$(vercel ls --json | jq -r '.[0].url')
print_success "Frontend deployed to: https://$VERCEL_URL"

# Go back to root
cd ..

# Update CORS settings
print_status "Updating CORS settings on Railway..."
cd backend
railway run --service backend -- python manage.py shell -c "
from django.conf import settings
print('CORS_ALLOWED_ORIGINS:', getattr(settings, 'CORS_ALLOWED_ORIGINS', []))
"

print_success "Deployment completed!"

echo ""
echo "🎉 Deployment Summary:"
echo "├── Backend:  $RAILWAY_URL"
echo "├── Frontend: https://$VERCEL_URL"
echo "├── Admin:    https://$VERCEL_URL/admin"
echo "└── API Docs: $RAILWAY_URL/api/docs/"
echo ""

# Health checks
print_status "Running health checks..."

echo "Checking backend health..."
if curl -f "$RAILWAY_URL/api/health/" > /dev/null 2>&1; then
    print_success "Backend is healthy"
else
    print_warning "Backend health check failed - may need a few more minutes to start"
fi

echo "Checking frontend..."
if curl -f "https://$VERCEL_URL" > /dev/null 2>&1; then
    print_success "Frontend is accessible"
else
    print_warning "Frontend check failed - may need a few more minutes"
fi

echo ""
print_success "🌟 Your app is now live in production!"
print_status "Visit https://$VERCEL_URL to see your app"

# Optional: Open in browser
if command -v open &> /dev/null; then
    read -p "Open app in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://$VERCEL_URL"
    fi
fi