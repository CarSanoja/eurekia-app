import { motion } from 'framer-motion'

const BADGE_CONFIG = {
  foundation: {
    emoji: '🏗️',
    name: 'Foundation Builder',
    description: 'Created your first habit',
    color: 'from-blue-500 to-blue-600',
    rarity: 'common'
  },
  consistency: {
    emoji: '⚡',
    name: 'Consistency Master',
    description: 'Completed 5 habits in a row',
    color: 'from-yellow-500 to-yellow-600',
    rarity: 'uncommon'
  },
  streak_7: {
    emoji: '🔥',
    name: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    color: 'from-orange-500 to-red-500',
    rarity: 'uncommon'
  },
  streak_30: {
    emoji: '👑',
    name: 'Monthly Master',
    description: 'Achieved a 30-day streak',
    color: 'from-purple-500 to-pink-500',
    rarity: 'rare'
  },
  comeback: {
    emoji: '💪',
    name: 'Comeback Hero',
    description: 'Bounced back after a break',
    color: 'from-green-500 to-emerald-600',
    rarity: 'uncommon'
  },
  mission_complete: {
    emoji: '🏆',
    name: 'Mission Complete',
    description: 'Completed your first mission',
    color: 'from-gold-500 to-yellow-500',
    rarity: 'epic'
  }
}

export default function BadgeDisplay({ badge, isNew = false, onClick }) {
  const config = BADGE_CONFIG[badge.type] || {
    emoji: '🎖️',
    name: 'Unknown Badge',
    description: 'Special achievement',
    color: 'from-gray-500 to-gray-600',
    rarity: 'common'
  }

  const rarityStyles = {
    common: 'shadow-md border-gray-200',
    uncommon: 'shadow-lg border-green-200 ring-2 ring-green-100',
    rare: 'shadow-xl border-blue-200 ring-2 ring-blue-100',
    epic: 'shadow-2xl border-purple-200 ring-4 ring-purple-100 animate-pulse'
  }

  return (
    <motion.div
      initial={isNew ? { scale: 0, rotate: -180 } : { scale: 1 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 260, 
        damping: 20,
        duration: isNew ? 0.6 : 0.2
      }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative bg-white rounded-2xl p-4 cursor-pointer
        ${rarityStyles[config.rarity]}
        transition-all duration-200
      `}
      onClick={onClick}
    >
      {/* Rarity Indicator */}
      {config.rarity !== 'common' && (
        <div className={`
          absolute -top-2 -right-2 w-6 h-6 rounded-full
          ${config.rarity === 'epic' ? 'bg-purple-500' : 
            config.rarity === 'rare' ? 'bg-blue-500' : 'bg-green-500'}
          flex items-center justify-center
        `}>
          <span className="text-xs font-bold text-white">
            {config.rarity === 'epic' ? '✦' : 
             config.rarity === 'rare' ? '★' : '♦'}
          </span>
        </div>
      )}

      {/* New Badge Indicator */}
      {isNew && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -top-3 -left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
        >
          NEW!
        </motion.div>
      )}

      <div className="text-center">
        <div className="text-4xl mb-2">{config.emoji}</div>
        <h3 className="font-bold text-gray-800 text-sm mb-1">{config.name}</h3>
        <p className="text-xs text-gray-600 leading-tight">{config.description}</p>
        
        {badge.awarded_at && (
          <p className="text-xs text-gray-400 mt-2">
            {new Date(badge.awarded_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Sparkle Effect for New Badges */}
      {isNew && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, repeat: 3, repeatType: 'reverse' }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-2 right-4 text-yellow-400">✨</div>
          <div className="absolute bottom-2 left-4 text-yellow-400">✨</div>
          <div className="absolute top-4 left-2 text-yellow-400">✨</div>
        </motion.div>
      )}
    </motion.div>
  )
}