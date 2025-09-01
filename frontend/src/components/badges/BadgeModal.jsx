import { motion, AnimatePresence } from 'framer-motion'

const BADGE_CONFIG = {
  foundation: {
    emoji: '🏗️',
    name: 'Foundation Builder',
    description: 'Created your first habit',
    longDescription: 'Every great journey begins with a single step. You\'ve laid the foundation for your hero transformation!',
    color: 'from-blue-500 to-blue-600',
    rarity: 'common',
    tips: ['Start with small, achievable habits', 'Consistency beats perfection', 'Track your progress daily']
  },
  consistency: {
    emoji: '⚡',
    name: 'Consistency Master',
    description: 'Completed 5 habits in a row',
    longDescription: 'You\'re showing incredible consistency! Small daily actions lead to extraordinary results.',
    color: 'from-yellow-500 to-yellow-600',
    rarity: 'uncommon',
    tips: ['Celebrate small wins', 'Build habit chains', 'Use visual reminders']
  },
  streak_7: {
    emoji: '🔥',
    name: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    longDescription: 'A full week of dedication! You\'re proving that you can stick to your commitments.',
    color: 'from-orange-500 to-red-500',
    rarity: 'uncommon',
    tips: ['Prepare for obstacles', 'Have backup plans', 'Focus on progress, not perfection']
  },
  streak_30: {
    emoji: '👑',
    name: 'Monthly Master',
    description: 'Achieved a 30-day streak',
    longDescription: 'Incredible! You\'ve maintained your habit for an entire month. You\'re building true mastery!',
    color: 'from-purple-500 to-pink-500',
    rarity: 'rare',
    tips: ['Scale up your habits', 'Add new challenges', 'Inspire others with your success']
  },
  comeback: {
    emoji: '💪',
    name: 'Comeback Hero',
    description: 'Bounced back after a break',
    longDescription: 'Resilience is your superpower! Coming back after a setback shows true hero strength.',
    color: 'from-green-500 to-emerald-600',
    rarity: 'uncommon',
    tips: ['Learn from setbacks', 'Start fresh each day', 'Use failure as fuel for success']
  },
  mission_complete: {
    emoji: '🏆',
    name: 'Mission Complete',
    description: 'Completed your first mission',
    longDescription: 'Outstanding achievement! You\'ve completed your mission and proven your dedication to growth.',
    color: 'from-gold-500 to-yellow-500',
    rarity: 'epic',
    tips: ['Set bigger goals', 'Share your success', 'Help others on their journey']
  }
}

export default function BadgeModal({ badge, isOpen, onClose }) {
  if (!isOpen || !badge) return null

  const config = BADGE_CONFIG[badge.type] || {
    emoji: '🎖️',
    name: 'Unknown Badge',
    description: 'Special achievement',
    longDescription: 'You\'ve earned a special badge for your efforts!',
    color: 'from-gray-500 to-gray-600',
    rarity: 'common',
    tips: []
  }

  const rarityColors = {
    common: 'text-gray-600',
    uncommon: 'text-green-600',
    rare: 'text-blue-600',
    epic: 'text-purple-600'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-8xl mb-4 animate-bounce">{config.emoji}</div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${rarityColors[config.rarity]} bg-opacity-10`}>
              {config.rarity.toUpperCase()} BADGE
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{config.name}</h2>
            <p className="text-gray-600 leading-relaxed">{config.longDescription}</p>
          </div>

          {/* Achievement Date */}
          {badge.awarded_at && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <span>🗓️</span>
                <span>Earned on {new Date(badge.awarded_at).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          )}

          {/* Tips Section */}
          {config.tips && config.tips.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                💡 Hero Tips
              </h3>
              <ul className="space-y-2">
                {config.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Metadata */}
          {badge.metadata && Object.keys(badge.metadata).length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Achievement Details</h3>
              <div className="bg-gray-50 rounded-2xl p-4">
                {Object.entries(badge.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                    <span className="text-sm font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Awesome! ✨
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}