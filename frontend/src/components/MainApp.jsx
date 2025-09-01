import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import DashboardPage from '../pages/DashboardPage'
import OnboardingPage from '../pages/OnboardingPage'

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

  return <DashboardPage />
}