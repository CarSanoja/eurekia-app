import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProgressStats from '../components/progress/ProgressStats'
import ProgressChart from '../components/progress/ProgressChart'
import HabitCalendar from '../components/progress/HabitCalendar'
import BadgeCollection from '../components/badges/BadgeCollection'
import badgeService from '../services/badgeService.jsx'
import apiService from '../services/apiService'
import { useAuth } from '../contexts/AuthContext'

export default function ProgressPage() {
  const { user } = useAuth()
  const [badges, setBadges] = useState([])
  const [progressStats, setProgressStats] = useState(null)
  const [chartData, setChartData] = useState([])
  const [calendarData, setCalendarData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState('overview') // overview, charts, calendar, badges

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all data in parallel
        const [badgeData, statsData, chartResponse, calendarResponse] = await Promise.all([
          badgeService.fetchUserBadges(),
          apiService.getProgressStats(),
          apiService.getProgressChart(30),
          apiService.getProgressCalendar(new Date().getFullYear(), new Date().getMonth() + 1)
        ])

        setBadges(badgeData.badges)
        setProgressStats(statsData)
        
        // Transform chart data to match component expectations
        const transformedChartData = chartResponse.progress_data.map(item => ({
          value: item.completion_rate,
          label: item.label,
          date: item.date
        }))
        setChartData(transformedChartData)
        
        // Transform calendar data
        setCalendarData(calendarResponse.calendar_data)
        
      } catch (error) {
        console.error('Failed to load progress data:', error)
        // Set fallback data on error
        setBadges([])
        setProgressStats({
          total_habits: 0,
          active_streaks: 0,
          total_checkins: 0,
          adherence_percentage: 0,
          current_week_progress: 0,
          best_streak: 0,
          habits_completed_today: 0,
          consistency_score: 0
        })
        setChartData([])
        setCalendarData([])
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
              <div className="text-3xl font-bold">{progressStats?.consistency_score || 0}%</div>
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
              <ProgressStats stats={progressStats || {}} />
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
                  data={chartData.map(d => ({ ...d, value: d.value / 10 }))} 
                  title="Habits Completed" 
                  type="bar"
                />
              </div>
            </div>
          )}

          {selectedView === 'calendar' && (
            <div className="space-y-6">
              <HabitCalendar habitData={calendarData} />
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                  <div className="text-3xl mb-2">🔥</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {calendarData.filter(h => h.completed).length}
                  </div>
                  <div className="text-sm text-gray-600">Total Completed</div>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-2xl font-bold text-blue-600">{calendarData.length}</div>
                  <div className="text-sm text-gray-600">Days Tracked</div>
                </div>
                <div className="bg-white rounded-2xl p-6 text-center shadow-md">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {calendarData.length > 0 ? Math.round((calendarData.filter(h => h.completed).length / calendarData.length) * 100) : 0}%
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
                {progressStats && Object.entries({
                  common: 0,
                  uncommon: 0, 
                  rare: 0,
                  epic: 0
                }).map(([rarity, count]) => (
                  <div key={rarity} className="bg-white rounded-2xl p-4 text-center shadow-md">
                    <div className="text-2xl mb-2">
                      {rarity === 'epic' ? '✦' : rarity === 'rare' ? '★' : rarity === 'uncommon' ? '♦' : '○'}
                    </div>
                    <div className="text-xl font-bold text-gray-800">{badges.length}</div>
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
                  onClick={() => badgeService.testBadgeNotification()}
                  className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-xl font-medium transition-colors"
                >
                  Test Badge Notification 🏆
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}