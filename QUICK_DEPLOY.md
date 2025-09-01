# 🚀 DEPLOY RÁPIDO - 15 MINUTOS

Todo está configurado automáticamente. Solo necesitas seguir estos pasos:

## 📋 PASO 1: Railway (Backend) - 5 minutos

### 1.1 Crear cuenta Railway
- Ve a https://railway.app
- Click "Login" → "Login with GitHub"
- Autoriza Railway

### 1.2 Crear proyecto
- Click "New Project"
- Select "Deploy from GitHub repo"
- Busca y selecciona `eurekia-app`
- Click "Deploy Now"

### 1.3 Configurar servicios
Railway detectará automáticamente el backend. Ahora agrega database:

**Agregar PostgreSQL:**
- Click "+ New" → "Database" → "Add PostgreSQL"
- Railway creará automáticamente la DB con pgvector

**Agregar Redis:**
- Click "+ New" → "Database" → "Add Redis"
- Railway conectará automáticamente

### 1.4 Variables de entorno
Click en tu servicio backend → "Variables" → Agrega estas:

```
DJANGO_SETTINGS_MODULE=quanta.settings.production
SECRET_KEY=tu-clave-super-secreta-aqui-cambiar
GOOGLE_API_KEY=tu-api-key-de-gemini
EMAIL_HOST_USER=quantalabsllc@gmail.com
EMAIL_HOST_PASSWORD=ndhnnlamyacspths
```

Railway agregará automáticamente:
- `DATABASE_URL` (de PostgreSQL)
- `REDIS_URL` (de Redis)

### 1.5 Obtener URL
Después del deployment, copia la URL (ej: `https://eurekia-backend-production.up.railway.app`)

---

## 🌐 PASO 2: Vercel (Frontend) - 5 minutos

### 2.1 Crear cuenta Vercel
- Ve a https://vercel.com
- Click "Login" → "Continue with GitHub"
- Autoriza Vercel

### 2.2 Importar proyecto
- Click "Add New..." → "Project"
- Busca `eurekia-app`
- Click "Import"

### 2.3 Configurar build
Vercel detectará Vite automáticamente, pero configura:

**Build Settings:**
- Framework Preset: `Vite`
- Build Command: `cd frontend && npm run build:prod`
- Output Directory: `frontend/dist`
- Install Command: `cd frontend && npm install`

### 2.4 Variables de entorno
Agrega estas variables:

```
VITE_API_URL=https://TU-URL-DE-RAILWAY/api
VITE_WS_URL=wss://TU-URL-DE-RAILWAY/ws
VITE_APP_NAME=Eurekia Quanta
NODE_ENV=production
```

**Reemplaza `TU-URL-DE-RAILWAY`** con la URL que copiaste del paso 1.5

### 2.5 Deploy
- Click "Deploy"
- Espera ~3 minutos
- ¡Tu frontend estará en `https://eurekia-app.vercel.app`!

---

## ⚡ PASO 3: Configurar CORS - 2 minutos

### 3.1 Actualizar Railway
En Railway → Backend → Variables, agregar:

```
ALLOWED_HOSTS=tu-dominio.up.railway.app
CORS_ALLOWED_ORIGINS=https://eurekia-app.vercel.app
```

### 3.2 Redeploy
- Railway: Click "Redeploy"
- Vercel: Click "Redeploy" (o será automático)

---

## 🧪 PASO 4: Testing - 3 minutos

### 4.1 Verificar Backend
Visita: `https://tu-dominio.up.railway.app/api/health/`

Deberías ver:
```json
{
  "status": "healthy",
  "database": "connected",
  "cache": "connected"
}
```

### 4.2 Verificar Frontend
Visita: `https://eurekia-app.vercel.app`

Deberías ver la aplicación funcionando.

### 4.3 Test completo
- Registra una cuenta
- Crea un hábito
- Verifica que funciona el AI (si tienes Gemini API Key)

---

## 🎉 ¡LISTO!

### URLs Finales:
- **App**: `https://eurekia-app.vercel.app`
- **API**: `https://tu-dominio.up.railway.app`
- **Admin**: `https://eurekia-app.vercel.app/admin`

### Costos:
- **Railway**: $0/mes (hasta 500 horas)
- **Vercel**: $0/mes (hasta 100GB bandwidth)
- **Total**: **GRATIS** 🎉

---

## 🚨 Si algo falla:

### Error de CORS:
```bash
# En Railway Variables:
CORS_ALLOWED_ORIGINS=https://eurekia-app.vercel.app,http://localhost:5173
ALLOWED_HOSTS=tu-dominio.up.railway.app,localhost
```

### Error de Database:
- Verifica que PostgreSQL está running en Railway
- Check que `DATABASE_URL` está configurada

### Error 500:
- Ve a Railway → Logs para ver el error específico
- Verifica todas las variables de entorno

---

**💡 Todo está automatizado. Estos pasos son solo para conectar los servicios. ¡El deployment debería tomar menos de 15 minutos!**