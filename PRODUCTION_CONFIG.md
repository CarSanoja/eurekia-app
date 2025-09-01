# 🔧 Configuración de Producción

## 📋 Variables de Entorno Necesarias

### Railway (Backend)
```env
# Django Settings
DJANGO_SETTINGS_MODULE=quanta.settings.production
SECRET_KEY=django-insecure-CAMBIAR-ESTO-POR-UNA-CLAVE-SECRETA-LARGA-Y-ALEATORIA
DEBUG=False

# Database (AUTO-GENERADO por Railway)
DATABASE_URL=postgresql://user:pass@host:port/db

# Redis (AUTO-GENERADO por Railway)  
REDIS_URL=redis://user:pass@host:port

# Google AI
GOOGLE_API_KEY=tu_gemini_api_key_aqui

# Email Configuration
EMAIL_HOST_USER=quantalabsllc@gmail.com
EMAIL_HOST_PASSWORD=ndhnnlamyacspths

# Security
ALLOWED_HOSTS=tu-app.up.railway.app
CORS_ALLOWED_ORIGINS=https://eurekia-app.vercel.app

# Optional
SENTRY_DSN=tu_sentry_dsn_para_monitoreo
```

### Vercel (Frontend)
```env
# API Configuration
VITE_API_URL=https://tu-app.up.railway.app/api
VITE_WS_URL=wss://tu-app.up.railway.app/ws

# App Configuration
VITE_APP_NAME=Eurekia Quanta
VITE_APP_VERSION=1.0.0
NODE_ENV=production

# Features
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_ANALYTICS=false
```

## 🔐 Secrets para GitHub Actions

Si quieres deployment automático, agrega estos secrets en GitHub:

```
# Railway
RAILWAY_TOKEN=tu_railway_token_aqui

# Vercel  
VERCEL_TOKEN=tu_vercel_token_aqui
VERCEL_ORG_ID=tu_vercel_org_id
VERCEL_PROJECT_ID=tu_vercel_project_id
```

## 🌐 URLs de Producción

### Después del deployment tendrás:

**Frontend (Vercel):**
- App Principal: `https://eurekia-app.vercel.app`
- Preview URLs: `https://eurekia-app-git-[branch].vercel.app`

**Backend (Railway):**
- API: `https://[tu-proyecto].up.railway.app`
- Health Check: `https://[tu-proyecto].up.railway.app/api/health/`
- Admin: `https://eurekia-app.vercel.app/admin` (proxy a Railway)

## 🔍 Endpoints Importantes

### Health & Monitoring
```
GET /api/health/     - Health check
GET /api/info/       - API information
GET /admin/          - Django admin
GET /api/docs/       - API documentation
```

### API Core
```
POST /api/auth/login/          - Login
POST /api/auth/register/       - Register  
GET  /api/habits/              - List habits
POST /api/habits/              - Create habit
GET  /api/reports/ai-report/   - AI progress report
```

## 🚀 Comandos de Deployment

### Deploy Automático (Recomendado)
```bash
# Simplemente push a main
git push origin main

# GitHub Actions hará:
# 1. Deploy backend a Railway
# 2. Deploy frontend a Vercel
# 3. Run tests
# 4. Health checks
```

### Deploy Manual
```bash
# Backend (Railway)
cd backend
railway login
railway up

# Frontend (Vercel)
cd frontend  
vercel login
vercel --prod
```

### Deploy con Script
```bash
# Usar el script automatizado
./deploy.sh
```

## 🔧 Configuración de Base de Datos

### Railway PostgreSQL
- **Versión**: PostgreSQL 15+
- **Extensiones**: pgvector habilitado automáticamente
- **Backups**: Automáticos por Railway
- **SSL**: Habilitado por defecto

### Migraciones
```bash
# Se ejecutan automáticamente en deployment
python manage.py migrate

# Para ejecutar manualmente:
railway run python manage.py migrate
```

## 📊 Monitoreo y Logs

### Railway Logs
```bash
railway logs --tail
railway logs --service backend
```

### Vercel Logs
```bash
vercel logs
vercel logs --follow
```

### Health Monitoring
- Railway provee métricas automáticas
- Vercel provee analytics de performance
- Configurar alertas en ambas plataformas

## 🔄 Backup & Recovery

### Base de Datos
- Railway: Backups automáticos diarios
- Download manual: Railway Dashboard → Database → Backups

### Código
- GitHub: Repositorio completo
- Rollback: Revert commit + push

### Recovery Rápido
```bash
# Rollback a deployment anterior
railway rollback
vercel rollback [deployment-url]
```

## 🛡️ Seguridad

### HTTPS
- ✅ Automático en ambas plataformas
- ✅ Certificados SSL gratuitos
- ✅ HTTP → HTTPS redirect

### Secrets
- ✅ Variables de entorno encriptadas
- ✅ No secrets en código
- ✅ Rotación regular de API keys

### Headers de Seguridad
- ✅ CORS configurado
- ✅ CSP headers
- ✅ XSS protection
- ✅ HTTPS enforcement

## 📈 Performance

### Frontend (Vercel)
- ✅ Global CDN
- ✅ Code splitting
- ✅ Image optimization
- ✅ Caching automático

### Backend (Railway)
- ✅ Gunicorn + múltiples workers
- ✅ Database connection pooling
- ✅ Redis caching
- ✅ Static files optimizados

## 💰 Costos Estimados

### Tier Gratuito
- **Railway**: $0/mes (500 horas compute)
- **Vercel**: $0/mes (100GB bandwidth)
- **Total**: **$0/mes** para desarrollo

### Producción (escalado)
- **Railway Pro**: ~$5-10/mes
- **Vercel Pro**: ~$20/mes
- **Total**: ~$25-30/mes para app profesional

---

**🎯 Con esta configuración tendrás una aplicación profesional en producción con HTTPS, base de datos, caching, y deployment automático!**