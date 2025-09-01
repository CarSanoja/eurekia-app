# 🌟 Eurekia - AI-Powered Habit Tracking Platform

[![Backend CI](https://github.com/CarSanoja/eurekia-app/workflows/Backend%20CI/badge.svg)](https://github.com/CarSanoja/eurekia-app/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/CarSanoja/eurekia-app/workflows/Frontend%20CI/badge.svg)](https://github.com/CarSanoja/eurekia-app/actions/workflows/frontend-ci.yml)
[![Security Scan](https://github.com/CarSanoja/eurekia-app/workflows/Security%20Scan/badge.svg)](https://github.com/CarSanoja/eurekia-app/actions/workflows/security-scan.yml)

A comprehensive full-stack habit tracking application designed specifically for teens, featuring AI-powered insights, real-time updates, gamified experiences, and personalized email engagement.

## ✨ Features

### 🧠 AI-Powered Intelligence
- **LangGraph Workflows**: Multi-step AI processes for complex habit analysis
- **Google Gemini Flash**: Fast, cost-effective AI for real-time insights  
- **Vector Embeddings**: Semantic search and content analysis with pgvector
- **Personalized Recommendations**: AI-generated habit suggestions and progress tips

### 🎮 Gamified Experience  
- **Achievement System**: Unlock badges and rewards for consistent habits
- **Streak Tracking**: Visual streak counters with recovery mechanisms
- **Progress Celebrations**: Animated celebrations and sound effects
- **Mission System**: Quest-like habit challenges and goals

### 📧 Smart Email Engagement
- **12 Aha Moments**: Strategic email sequences for user journey
- **AI Personalization**: Dynamic content based on user behavior
- **Aesthetic Templates**: Modern, responsive HTML email designs
- **Send Time Optimization**: AI-powered timing for maximum engagement

### ⚡ Real-Time Features
- **WebSocket Integration**: Live dashboard updates and notifications
- **Offline Support**: IndexedDB caching for offline functionality
- **Progressive Web App**: Native-like experience on all devices
- **Performance Optimized**: Code splitting and lazy loading

### 🌍 Accessibility & Internationalization
- **Multi-language Support**: i18n implementation with English/Spanish
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark/Light Mode**: Theme switching with user preferences
- **Accessibility Features**: WCAG compliant interface elements

## 🏗️ Architecture

### Backend (Django + PostgreSQL)
```
backend/
├── ai_services/           # LangGraph AI workflows
├── messaging/            # Email system with templates
├── realtime/             # WebSocket consumers
├── habits/               # Core habit tracking models
├── analytics/            # User analytics and insights
├── admin_api/            # Admin dashboard API
└── core/                 # Database migrations & config
```

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/           # Route-based page components
│   ├── services/        # API and WebSocket services
│   ├── utils/           # Helper functions
│   ├── hooks/           # Custom React hooks
│   └── locales/         # Internationalization files
└── public/              # Static assets
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ with pgvector extension
- Redis (for Celery)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
Create `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost/eurekia_db

# Google AI
GOOGLE_API_KEY=your_gemini_api_key

# Email
EMAIL_HOST_USER=your_gmail@gmail.com  
EMAIL_HOST_PASSWORD=your_app_password

# Redis
REDIS_URL=redis://localhost:6379

# Django
SECRET_KEY=your_secret_key
DEBUG=True
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test --verbosity=2
```

### Frontend Tests  
```bash
cd frontend
npm test
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 📊 Key Technologies

| Category | Technologies |
|----------|-------------|
| **Backend** | Django, PostgreSQL, pgvector, Celery, Redis |
| **Frontend** | React, Vite, Tailwind CSS, React Query |
| **AI/ML** | LangGraph, Google Gemini Flash, Vector Embeddings |
| **Real-time** | Django Channels, WebSockets |
| **DevOps** | GitHub Actions, Docker, Dependabot |
| **Monitoring** | Sentry, Analytics Dashboard |

## 🔄 CI/CD Pipeline

### Automated Testing
- **Backend**: Django tests, migrations, linting (flake8, black)
- **Frontend**: Jest tests, ESLint, type checking, build verification
- **Security**: CodeQL analysis, dependency scanning, Docker security

### Deployment
- **Staging**: Automatic deployment on PR merge
- **Production**: Manual deployment with approval gates
- **Preview**: PR-based preview deployments

## 📈 Performance Metrics

- **Bundle Size**: Optimized with code splitting and tree shaking
- **Lighthouse Score**: 95+ performance, accessibility, SEO
- **Database**: Query optimization with database indexes
- **Caching**: Multi-level caching strategy (Redis, React Query)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow conventional commits
- Ensure test coverage > 80%
- Run linting and type checking
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AI Integration**: Google Gemini Flash for fast, intelligent responses
- **Vector Database**: pgvector for semantic search capabilities  
- **Real-time Updates**: Django Channels for WebSocket support
- **UI Components**: Tailwind CSS for modern, responsive design

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/CarSanoja/eurekia-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CarSanoja/eurekia-app/discussions)
- **Email**: wuopcarlos@gmail.com

---

<div align="center">
  <strong>Built with ❤️ for teen empowerment and habit building</strong>
</div>