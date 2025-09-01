import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import HabitQuestCreator from '../components/habits/HabitQuestCreator'
import BadgeCollection from '../components/badges/BadgeCollection'
import badgeService from '../services/badgeService.jsx'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user, logout, token } = useAuth()
  const [showQuestCreator, setShowQuestCreator] = useState(false)
  const [habits, setHabits] = useState([])
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHabits()
    fetchBadges()
  }, [])

  const fetchBadges = async () => {
    try {
      const badgeData = await badgeService.fetchUserBadges()
      setBadges(badgeData.badges || [])
    } catch (error) {
      console.error('Failed to load badges:', error)
      setBadges([]) // Set empty array on error
    }
  }

  const fetchHabits = async () => {
    try {
      const authToken = token || localStorage.getItem('eurekia_token')
      
      if (!authToken) {
        console.error('No auth token available for fetching habits')
        setHabits([])
        return
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/habits/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setHabits(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch habits:', response.status)
        setHabits([])
      }
    } catch (error) {
      console.error('Error fetching habits:', error)
      setHabits([])
    } finally {
      setLoading(false)
    }
  }

  const handleHabitCreated = (newHabit) => {
    setHabits([newHabit, ...habits])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-white transform hover:scale-110 transition-transform duration-200"
              style={{ backgroundColor: user?.avatar_color || '#0ea5e9' }}
            >
              {user?.avatar_icon || '🌟'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                {t('dashboard.greeting', { name: user?.name })}
              </h1>
              <p className="text-white/90 font-medium">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <span className="text-white font-bold">⚡ {t('dashboard.level')}</span>
            </div>
            {user?.is_staff && (
              <Link
                to="/studio"
                className="text-sm text-white font-medium bg-blue-500/80 hover:bg-blue-600 px-4 py-2 rounded-full transition-colors flex items-center gap-1"
              >
                🔧 Admin Studio
              </Link>
            )}
            <button
              onClick={logout}
              className="text-sm text-white/80 hover:text-white bg-white/10 px-3 py-2 rounded-full"
            >
              {t('auth.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2 animate-pulse">
                    {t('dashboard.questDashboard')}
                  </h2>
                  <p className="text-white/90 text-lg">
                    {t('dashboard.questDescription')}
                  </p>
                </div>
                <div className="text-6xl animate-bounce">
                  🎯
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:scale-105 transition-transform duration-200">
                  <div className="text-3xl mb-2">💪</div>
                  <div className="text-3xl font-bold">{habits.length}</div>
                  <div className="text-sm text-white/80 font-medium">{t('dashboard.activeQuests')}</div>
                </div>
                <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:scale-105 transition-transform duration-200">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className="text-3xl font-bold">{(habits?.length || 0) * 15}</div>
                  <div className="text-sm text-white/80 font-medium">{t('dashboard.xpEarned')}</div>
                </div>
                <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:scale-105 transition-transform duration-200">
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-3xl font-bold">{Math.max(...(habits?.map(h => h.current_streak || 0) || [0]))}</div>
                  <div className="text-sm text-white/80 font-medium">{t('dashboard.dayStreak')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              ⚡ Power-Ups <span className="text-lg ml-2">(Choose your next action!)</span>
            </h3>
            <div className={`grid gap-6 ${user?.is_staff ? 'md:grid-cols-2 lg:grid-cols-5' : 'md:grid-cols-2 lg:grid-cols-4'}`}>
              <button 
                onClick={() => setShowQuestCreator(true)}
                className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 shadow-lg border-0 text-white hover:scale-105 transform transition-all duration-200 hover:shadow-xl"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                    <span className="text-3xl">💪</span>
                  </div>
                  <h3 className="font-bold text-lg">Start Quest</h3>
                  <p className="text-sm text-white/90 mt-2">Add a new habit quest!</p>
                </div>
              </button>

              <button className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 shadow-lg border-0 text-white hover:scale-105 transform transition-all duration-200 hover:shadow-xl">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                    <span className="text-3xl">😊</span>
                  </div>
                  <h3 className="font-bold text-lg">Mood Check</h3>
                  <p className="text-sm text-white/90 mt-2">How are you feeling?</p>
                </div>
              </button>

              <button className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 shadow-lg border-0 text-white hover:scale-105 transform transition-all duration-200 hover:shadow-xl">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="font-bold text-lg">Hero Mission</h3>
                  <p className="text-sm text-white/90 mt-2">Define who you are!</p>
                </div>
              </button>

              <button className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 shadow-lg border-0 text-white hover:scale-105 transform transition-all duration-200 hover:shadow-xl">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                    <span className="text-3xl">📊</span>
                  </div>
                  <h3 className="font-bold text-lg">Progress Report</h3>
                  <p className="text-sm text-white/90 mt-2">See your epic growth!</p>
                </div>
              </button>

              {user?.is_staff && (
                <Link 
                  to="/studio"
                  className="bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl p-6 shadow-lg border-0 text-white hover:scale-105 transform transition-all duration-200 hover:shadow-xl block"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                      <span className="text-3xl">🔧</span>
                    </div>
                    <h3 className="font-bold text-lg">Admin Studio</h3>
                    <p className="text-sm text-white/90 mt-2">Manage your platform!</p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Habits Section */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-lg border-2 border-indigo-100">
            <div className="p-6 border-b border-indigo-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-indigo-800 flex items-center">
                    🎮 Today's Quests
                  </h3>
                  <p className="text-indigo-600 font-medium">Complete quests to earn XP and level up!</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full px-4 py-2 text-white font-bold">
                  🏆 0 XP Today
                </div>
              </div>
            </div>
            <div className="p-8">
              {loading ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4 animate-spin">⚡</div>
                  <p className="text-indigo-600 text-lg">Loading your quests...</p>
                </div>
              ) : habits.length === 0 ? (
                <div className="text-center text-gray-600 py-16">
                  <div className="text-8xl mb-6 animate-pulse">🌟</div>
                  <h4 className="text-2xl font-bold mb-4 text-indigo-800">Your Adventure Awaits!</h4>
                  <p className="text-lg mb-6 text-indigo-600">Ready to start your first quest and become a habit hero?</p>
                  <button 
                    onClick={() => setShowQuestCreator(true)}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-8 rounded-2xl text-xl hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    🚀 Start Your First Quest!
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {(habits || []).map((habit) => (
                    <div key={habit.id} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-indigo-800 mb-2">{habit.title}</h4>
                          <div className="flex items-center space-x-4">
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                              🔥 {habit.current_streak || 0} day streak
                            </span>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                              {habit.difficulty_level} mode
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transform transition-all duration-200 shadow-lg">
                            ✅ Complete Quest
                          </button>
                          <div className="text-2xl">⚡</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Badge Collection */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-lg border-2 border-yellow-100">
            <div className="p-6">
              <BadgeCollection badges={badges.slice(0, 6)} />
              {badges.length > 6 && (
                <div className="text-center mt-4">
                  <Link 
                    to="/progress?view=badges"
                    className="text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-2"
                  >
                    View All Badges ({badges.length}) →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <HabitQuestCreator 
        isOpen={showQuestCreator}
        onClose={() => setShowQuestCreator(false)}
        onHabitCreated={handleHabitCreated}
      />
    </div>
  )
}