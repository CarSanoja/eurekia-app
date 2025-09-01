import { motion } from 'framer-motion'

export default function ProgressStats({ stats }) {
  const defaultStats = {
    total_habits: 0,
    active_streaks: 0,
    total_checkins: 0,
    adherence_percentage: 0,
    current_week_progress: 0,
    best_streak: 0,
    habits_completed_today: 0,
    consistency_score: 0
  }

  const data = { ...defaultStats, ...stats }

  const statCards = [
    {
      label: 'Total Habits',
      value: data.total_habits,
      icon: '🎯',
      color: 'from-blue-500 to-blue-600',
      description: 'Habits created'
    },
    {
      label: 'Active Streaks',
      value: data.active_streaks,
      icon: '🔥',
      color: 'from-orange-500 to-red-500',
      description: 'Currently active'
    },
    {
      label: 'Check-ins',
      value: data.total_checkins,
      icon: '✅',
      color: 'from-green-500 to-emerald-600',
      description: 'Total completions'
    },
    {
      label: 'Adherence',
      value: `${data.adherence_percentage}%`,
      icon: '📊',
      color: 'from-purple-500 to-pink-500',
      description: 'Success rate'
    },
    {
      label: 'Week Progress',
      value: `${data.current_week_progress}%`,
      icon: '📅',
      color: 'from-indigo-500 to-blue-500',
      description: 'This week'
    },
    {
      label: 'Best Streak',
      value: data.best_streak,
      icon: '🏆',
      color: 'from-yellow-500 to-orange-500',
      description: 'Personal record'
    },
    {
      label: 'Today',
      value: `${data.habits_completed_today}`,
      icon: '⭐',
      color: 'from-teal-500 to-cyan-500',
      description: 'Completed today'
    },
    {
      label: 'Consistency',
      value: `${data.consistency_score}%`,
      icon: '⚡',
      color: 'from-pink-500 to-rose-500',
      description: 'Overall score'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          📈 Progress Overview
        </h2>
        <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
          View Details
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-200"
          >
            <div className={`
              w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} 
              flex items-center justify-center text-2xl text-white mb-3 mx-auto
              shadow-lg
            `}>
              {card.icon}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {card.value}
              </div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                {card.label}
              </div>
              <div className="text-xs text-gray-500">
                {card.description}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100"
      >
        <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
          🧠 Smart Insights
        </h3>
        
        <div className="space-y-3">
          {data.adherence_percentage >= 80 && (
            <div className="flex items-center gap-3 bg-green-100 rounded-xl p-3">
              <span className="text-2xl">🌟</span>
              <div>
                <div className="font-semibold text-green-800">Excellent Performance!</div>
                <div className="text-sm text-green-600">
                  Your {data.adherence_percentage}% adherence rate shows incredible consistency.
                </div>
              </div>
            </div>
          )}
          
          {data.active_streaks > 0 && (
            <div className="flex items-center gap-3 bg-orange-100 rounded-xl p-3">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="font-semibold text-orange-800">Streaks Active!</div>
                <div className="text-sm text-orange-600">
                  You have {data.active_streaks} active streak{data.active_streaks > 1 ? 's' : ''}. Keep the momentum!
                </div>
              </div>
            </div>
          )}
          
          {data.current_week_progress < 50 && (
            <div className="flex items-center gap-3 bg-blue-100 rounded-xl p-3">
              <span className="text-2xl">💪</span>
              <div>
                <div className="font-semibold text-blue-800">Room for Growth</div>
                <div className="text-sm text-blue-600">
                  This week is {data.current_week_progress}% complete. There's still time to improve!
                </div>
              </div>
            </div>
          )}

          {data.best_streak > 7 && (
            <div className="flex items-center gap-3 bg-yellow-100 rounded-xl p-3">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="font-semibold text-yellow-800">Streak Champion!</div>
                <div className="text-sm text-yellow-600">
                  Your best streak of {data.best_streak} days shows you can achieve great things!
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}