import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import DashboardPage from '../pages/DashboardPage'
import OnboardingPage from '../pages/OnboardingPage'
import SettingsPage from '../pages/SettingsPage'
import HabitsPage from '../pages/HabitsPage'
import MissionPage from '../pages/MissionPage'
import MoodPage from '../pages/MoodPage'
import ReportsPage from '../pages/ReportsPage'
import ProgressPage from '../pages/ProgressPage'

// Navigation Component
function AppNavigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/habits', icon: '🎯', label: 'Quests' },
    { path: '/progress', icon: '📈', label: 'Progress' },
    { path: '/mood', icon: '😊', label: 'Mood' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-purple-100 z-50">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function MainApp() {
  const { user } = useAuth()
  const [needsOnboarding, setNeedsOnboarding] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Check if user needs onboarding
      // A user needs onboarding if they don't have an avatar icon set
      const hasCompletedOnboarding = user.avatar_icon && user.avatar_icon !== ''
      setNeedsOnboarding(!hasCompletedOnboarding)
      setLoading(false)
    }
  }, [user])

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="bg-white/95 rounded-3xl p-8 text-center shadow-2xl">
          <div className="text-6xl mb-4 animate-spin">⚡</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Loading your adventure...
          </h2>
          <p className="text-gray-600">
            Getting everything ready for you! 🚀
          </p>
        </div>
      </div>
    )
  }

  if (needsOnboarding) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen pb-20">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/mission" element={<MissionPage />} />
        <Route path="/mood" element={<MoodPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <AppNavigation />
    </div>
  )
}