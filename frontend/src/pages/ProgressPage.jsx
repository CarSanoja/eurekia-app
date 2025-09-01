import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProgressStats from '../components/progress/ProgressStats'
import ProgressChart from '../components/progress/ProgressChart'
import HabitCalendar from '../components/progress/HabitCalendar'
import BadgeCollection from '../components/badges/BadgeCollection'
import badgeService from '../services/badgeService.jsx'
import { useAuth } from '../contexts/AuthContext'

// Demo data for progress tracking
const generateDemoData = () => {
  const data = []
  const labels = []
  const habitData = []
  
  // Generate last 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Simulate varying completion rates
    const completionRate = Math.max(0, Math.min(100, 70 + Math.random() * 40 - 20))
    const habitsTotal = 3
    const habitsCompleted = Math.round((completionRate / 100) * habitsTotal)
    
    data.push({
      value: completionRate,
      label: i === 29 || i === 15 || i === 0 ? 
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
      date: dateStr
    })

    // Generate individual habit data
    const habits = ['Morning Exercise', 'Reading', 'Meditation']
    habits.forEach((habitName, index) => {
      habitData.push({
        date: dateStr,
        name: habitName,
        completed: index < habitsCompleted,
        habit_id: index + 1
      })
    })
  }

  return { chartData: data, habitData }
}

export default function ProgressPage() {
  const { user } = useAuth()
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState('overview') // overview, charts, calendar, badges
  
  const { chartData, habitData } = generateDemoData()

  // Demo stats
  const demoStats = {
    total_habits: 3,
    active_streaks: 2,
    total_checkins: 47,
    adherence_percentage: 78,
    current_week_progress: 85,
    best_streak: 12,
    habits_completed_today: 2,
    consistency_score: 82
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const badgeData = await badgeService.fetchUserBadges()
        setBadges(badgeData.badges)
      } catch (error) {
        console.error('Failed to load badges:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Listen for badge updates
    const unsubscribe = badgeService.addListener(setBadges)
    return unsubscribe
  }, [])

  const viewTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'charts', label: 'Charts', icon: '📈' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'badges', label: 'Badges', icon: '🏆' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-lg text-center">
            <div className="text-6xl mb-4 animate-spin">⚡</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Your Progress...</h2>
            <p className="text-gray-600">Getting your achievements ready! 🚀</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            📈 Progress Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Track your hero journey and celebrate achievements! 🎉
          </p>
        </motion.div>

        {/* Hero Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-6 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{user?.avatar_icon || '🦸'}</span>
                <div>
                  <h2 className="text-2xl font-bold">{user?.name || 'Hero'}</h2>
                  <p className="text-purple-100">Level: Consistency Master</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{demoStats.consistency_score}%</div>
              <div className="text-purple-100">Consistency Score</div>
            </div>
          </div>
        </motion.div>

        {/* View Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-md">
          <div className="flex gap-2">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all
                  ${selectedView === tab.id 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content based on selected view */}
        <motion.div
          key={selectedView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {selectedView === 'overview' && (
            <div className="space-y-6">
              <ProgressStats stats={demoStats} />
              <div className="grid md:grid-cols-2 gap-6">
                <ProgressChart 
                  data={chartData} 
                  title="Daily Completion Rate" 
                  type="line"
                />
                <BadgeCollection badges={badges.slice(0, 4)} />
              </div>
            </div>
          )}

          {selectedView === 'charts' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <ProgressChart 
                  data={chartData} 
                  title="Daily Completion Rate" 
                  type="line"
                />
                <ProgressChart 
                  data={chartData.map(d => ({ ...d, value: Math.random() * 10 + 5 }))} 
                  title="Time Spent (hours)" 
                  type="bar"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <ProgressChart 
                  data={chartData.map(d => ({ ...d, value: Math.random() * 100 }))} 
                  title="Mood Score" 
                  type="line"
                />
                <ProgressChart 
                  data={chartData.map(d => ({ ...d, value: Math.floor(Math.random() * 5) + 1 }))} 
                  title="Habits per Day" 
                  type="bar"
                />
              </div>
            </div>
          )}

          {selectedView === 'calendar' && (
            <div className="space-y-6">
              <HabitCalendar habitData={habitData} />
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {habitData.filter(h => h.completed).length}
                  </div>
                  <div className="text-sm text-gray-600">Total Completed</div>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-2xl font-bold text-blue-600">30</div>
                  <div className="text-sm text-gray-600">Days Tracked</div>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((habitData.filter(h => h.completed).length / habitData.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'badges' && (
            <div className="space-y-6">
              <BadgeCollection badges={badges} showAll={true} />
              
              {/* Badge Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                {Object.entries(badgeService.getBadgeStats().byRarity).map(([rarity, count]) => (
                  <div key={rarity} className="bg-white rounded-2xl p-4 text-center shadow-md">
                    <div className="text-2xl mb-2">
                      {rarity === 'epic' ? '✦' : rarity === 'rare' ? '★' : rarity === 'uncommon' ? '♦' : '○'}
                    </div>
                    <div className="text-xl font-bold text-gray-800">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">{rarity}</div>
                  </div>
                ))}
              </div>

              {/* Achievement Motivation */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-xl font-bold mb-2">Keep Going, Hero!</h3>
                <p className="text-yellow-100 mb-4">
                  You've earned {badges.length} badges so far. Every small step counts towards your transformation!
                </p>
                <button 
                  onClick={() => badgeService.awardBadge('foundation', { test: true })}
                  className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-xl font-medium transition-colors"
                >
                  Test Badge System 🏆
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}