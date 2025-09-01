# 🚀 Eurekia Deployment Guide

This guide will help you deploy the Eurekia application to production using Railway (backend) and Vercel (frontend).

## 📋 Prerequisites

Before deploying, ensure you have:
- GitHub account with repository access
- Railway account (https://railway.app)
- Vercel account (https://vercel.com)
- All required environment variables

## 🔑 Required Secrets

### GitHub Repository Secrets

Add these secrets to your GitHub repository (`Settings` → `Secrets and variables` → `Actions`):

#### Railway Secrets
```
RAILWAY_TOKEN=your_railway_api_token
```

#### Vercel Secrets
```
VERCEL_TOKEN=your_vercel_api_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

## 🚀 Deployment Steps

### Step 1: Railway Backend Setup

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub
   - Connect your repository

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `eurekia-app` repository
   - Select `backend` directory

3. **Configure Environment Variables**
   ```
   DJANGO_SETTINGS_MODULE=quanta.settings.production
   SECRET_KEY=your_super_secret_key_here
   GOOGLE_API_KEY=your_gemini_api_key
   EMAIL_HOST_USER=your_gmail_email
   EMAIL_HOST_PASSWORD=your_gmail_app_password
   ALLOWED_HOSTS=eurekia-backend.up.railway.app
   CORS_ALLOWED_ORIGINS=https://eurekia-app.vercel.app
   ```

4. **Add Database**
   - Click "Add Service" → "Database" → "PostgreSQL"
   - Railway will automatically provide `DATABASE_URL`

5. **Add Redis**
   - Click "Add Service" → "Database" → "Redis"  
   - Railway will automatically provide `REDIS_URL`

6. **Get Railway Token**
   - Go to Account Settings → Tokens
   - Create new token
   - Add to GitHub Secrets as `RAILWAY_TOKEN`

### Step 2: Vercel Frontend Setup

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub
   - Import `eurekia-app` repository

2. **Configure Build Settings**
   - Build Command: `cd frontend && npm run build:prod`
   - Output Directory: `frontend/dist`
   - Install Command: `cd frontend && npm install`

3. **Environment Variables**
   ```
   VITE_API_URL=https://your-app.up.railway.app/api
   VITE_WS_URL=wss://your-app.up.railway.app/ws
   VITE_APP_NAME=Eurekia Quanta
   NODE_ENV=production
   ```

4. **Get Vercel Details**
   - Go to Project Settings → General
   - Copy Project ID → Add to GitHub Secrets as `VERCEL_PROJECT_ID`
   - Copy Team ID → Add to GitHub Secrets as `VERCEL_ORG_ID`
   - Go to Account Settings → Tokens
   - Create new token → Add to GitHub Secrets as `VERCEL_TOKEN`

## 🔄 Automatic Deployment

Once configured, deployment is automatic:

1. **Push to main branch** triggers deployment
2. **Backend deploys first** to Railway
3. **Frontend deploys second** to Vercel (after backend is healthy)
4. **Post-deployment tests** run automatically
5. **Lighthouse performance audit** runs on frontend

## 📱 Production URLs

After successful deployment:

- **Frontend**: https://eurekia-app.vercel.app
- **Backend API**: https://eurekia-backend.up.railway.app
- **Admin Panel**: https://eurekia-app.vercel.app/admin
- **API Documentation**: https://eurekia-backend.up.railway.app/api/docs/

## 🔧 Manual Deployment

### Deploy Backend (Railway)
```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# Login and deploy
railway login
cd backend
railway up
```

### Deploy Frontend (Vercel)  
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
cd frontend
vercel --prod
```

## 🩺 Health Monitoring

### Health Check Endpoints
- **Backend Health**: `GET /api/health/`
- **API Info**: `GET /api/info/`

### Expected Response
```json
{
  "status": "healthy",
  "database": "connected", 
  "cache": "connected",
  "timestamp": 1704067200,
  "version": "1.0.0"
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Check DATABASE_URL is set correctly in Railway
# Ensure PostgreSQL service is running
```

#### 2. CORS Errors
```bash
# Verify CORS_ALLOWED_ORIGINS includes Vercel domain
# Check ALLOWED_HOSTS includes Railway domain
```

#### 3. Build Failures
```bash
# Check all dependencies are in package.json/requirements.txt
# Verify Node.js/Python versions are correct
```

#### 4. Environment Variables
```bash
# Double-check all required variables are set
# Ensure secrets are added to GitHub repository
```

## 📊 Performance Monitoring

- **Lighthouse CI**: Runs on every deployment
- **Performance budgets**: Enforced via GitHub Actions
- **Error tracking**: Configure Sentry for production monitoring

## 🔄 Rollback Strategy

### Quick Rollback
1. Go to Railway dashboard → Deployments
2. Click "Redeploy" on previous successful deployment
3. Go to Vercel dashboard → Deployments  
4. Click "Promote to Production" on previous deployment

### Full Rollback via Git
```bash
git revert HEAD
git push origin main
# Automatic redeployment will trigger
```

## 📧 Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Review Railway/Vercel deployment logs
3. Test endpoints manually
4. Contact support: carlos.6sanoja@gmail.com

---

## 🎉 Success Checklist

- [ ] Backend deploying to Railway
- [ ] Frontend deploying to Vercel  
- [ ] Database and Redis connected
- [ ] Environment variables configured
- [ ] HTTPS certificates working
- [ ] Health checks passing
- [ ] Performance audits passing
- [ ] Error monitoring active

**🌟 Your app is now live in production with HTTPS!**