import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playSound } from '../../utils/soundEffects'

const CELEBRATION_TYPES = {
  streak: {
    1: { emoji: '🎯', title: 'First Step!', message: 'You completed your first habit! Every expert was once a beginner. Keep going! 💪', color: 'from-green-400 to-blue-500' },
    3: { emoji: '🔥', title: '3-Day Streak!', message: 'You\'re on fire! Three days in a row - you\'re building momentum! 🚀', color: 'from-orange-400 to-red-500' },
    7: { emoji: '⭐', title: 'Week Warrior!', message: 'A whole week! You\'re proving that consistency beats perfection. Amazing! 🌟', color: 'from-purple-400 to-pink-500' },
    14: { emoji: '💎', title: 'Two Week Titan!', message: 'Two weeks strong! You\'re turning this habit into a superpower! 💪', color: 'from-blue-400 to-indigo-500' },
    30: { emoji: '👑', title: 'Monthly Master!', message: 'A FULL MONTH! You\'ve officially mastered this habit. You\'re a true champion! 🏆', color: 'from-yellow-400 to-orange-500' },
    50: { emoji: '🦸', title: 'Hero Status!', message: '50 days! You\'ve transcended from beginner to habit hero. Incredible dedication! ⚡', color: 'from-indigo-400 to-purple-500' },
    100: { emoji: '🚀', title: 'Century Club!', message: '100 DAYS! You\'ve reached legendary status. Your consistency is an inspiration! 🌟', color: 'from-pink-400 to-red-500' }
  },
  badge: {
    foundation: { emoji: '🏗️', title: 'Foundation Builder!', message: 'You\'ve created your first habit! Every skyscraper starts with a strong foundation. 🌟', color: 'from-blue-400 to-cyan-500' },
    streak_7: { emoji: '🔥', title: 'Week Warrior!', message: 'Seven days of consistency! You\'re building unstoppable momentum! ⚡', color: 'from-orange-400 to-red-500' },
    streak_30: { emoji: '👑', title: 'Monthly Master!', message: 'Thirty days of excellence! You\'ve proven your commitment to growth! 💎', color: 'from-purple-400 to-pink-500' },
    consistency: { emoji: '⚡', title: 'Consistency Champion!', message: '80% completion rate! Your dedication is paying off big time! 🚀', color: 'from-green-400 to-teal-500' },
    comeback: { emoji: '💪', title: 'Comeback Kid!', message: 'You came back stronger! Resilience is your superpower! 🌟', color: 'from-indigo-400 to-blue-500' },
    perfectionist: { emoji: '🎯', title: 'Perfect Week!', message: '100% completion this week! Your focus is absolutely incredible! ✨', color: 'from-yellow-400 to-orange-500' }
  },
  level: {
    2: { emoji: '📈', title: 'Level 2!', message: 'You\'ve leveled up! Your habit journey is gaining momentum! 🚀', color: 'from-green-400 to-blue-500' },
    5: { emoji: '🌟', title: 'Level 5!', message: 'Halfway to Level 10! You\'re building serious habit strength! 💪', color: 'from-purple-400 to-pink-500' },
    10: { emoji: '🏆', title: 'Level 10!', message: 'Double digits! You\'ve reached elite habit hero status! ⚡', color: 'from-yellow-400 to-orange-500' },
    20: { emoji: '👑', title: 'Level 20!', message: 'You\'re in the top tier of habit heroes! Legendary dedication! 💎', color: 'from-indigo-400 to-purple-500' }
  },
  milestone: {
    habits_5: { emoji: '🎮', title: '5 Active Habits!', message: 'You\'re juggling 5 habits like a pro! Your life balance is incredible! 🌟', color: 'from-cyan-400 to-blue-500' },
    habits_10: { emoji: '🚀', title: '10 Active Habits!', message: 'TEN habits?! You\'re operating at superhuman levels! Amazing! ⚡', color: 'from-pink-400 to-red-500' },
    total_checkins_50: { emoji: '📊', title: '50 Check-ins!', message: 'Fifty completed habits! Your consistency graph is beautiful! 📈', color: 'from-green-400 to-teal-500' },
    total_checkins_100: { emoji: '💯', title: '100 Check-ins!', message: 'ONE HUNDRED completions! You\'re a habit completion machine! 🔥', color: 'from-orange-400 to-yellow-500' }
  }
}

function FireworksEffect({ color }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 1,
            scale: 0,
            x: '50%',
            y: '50%'
          }}
          animate={{
            opacity: 0,
            scale: 2,
            x: `${50 + (Math.cos(i * 30 * Math.PI / 180) * 200)}%`,
            y: `${50 + (Math.sin(i * 30 * Math.PI / 180) * 200)}%`
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
            ease: "easeOut"
          }}
          className="absolute w-4 h-4 rounded-full"
          style={{
            background: `linear-gradient(45deg, ${color.split(' ')[0]}, ${color.split(' ')[2]})`
          }}
        />
      ))}
    </div>
  )
}

function FloatingEmojis({ emoji }) {
  const emojis = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 200,
    x: Math.random() * 300 - 150,
    y: Math.random() * 200 - 100
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {emojis.map(item => (
        <motion.div
          key={item.id}
          initial={{ 
            opacity: 0,
            scale: 0,
            x: 0,
            y: 0,
            rotate: 0
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.5, 1.2, 0],
            x: item.x,
            y: item.y,
            rotate: Math.random() * 360
          }}
          transition={{
            duration: 2.5,
            delay: item.delay / 1000,
            ease: "easeOut"
          }}
          className="absolute text-4xl"
          style={{
            left: '50%',
            top: '50%'
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </div>
  )
}

export default function CelebrationModal({ 
  celebration, 
  isVisible, 
  onClose,
  autoClose = true,
  duration = 5000
}) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    if (isVisible && celebration) {
      // Play celebration sound
      playSound.milestone()
      
      // Show content after initial animation
      setTimeout(() => setShowContent(true), 500)
      
      // Auto close if enabled
      if (autoClose) {
        setTimeout(() => onClose(), duration)
      }
    } else {
      setShowContent(false)
    }
  }, [isVisible, celebration, autoClose, duration, onClose])

  if (!isVisible || !celebration) return null

  const celebrationData = CELEBRATION_TYPES[celebration.type]?.[celebration.value] || 
                         CELEBRATION_TYPES[celebration.type] || {
    emoji: '🎉',
    title: 'Awesome!',
    message: 'You did something amazing!',
    color: 'from-purple-400 to-pink-500'
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60"
          onClick={onClose}
        />

        {/* Main celebration container */}
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.3,
            rotateY: 90
          }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            rotateY: 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.8,
            y: -50
          }}
          transition={{ 
            type: "spring",
            damping: 15,
            stiffness: 300,
            duration: 0.8
          }}
          className="relative z-10 mx-4 max-w-md w-full"
        >
          {/* Fireworks background */}
          <FireworksEffect color={celebrationData.color} />
          
          {/* Floating emojis */}
          <FloatingEmojis emoji={celebrationData.emoji} />

          {/* Main card */}
          <div className={`bg-gradient-to-br ${celebrationData.color} p-8 rounded-3xl shadow-2xl border-4 border-white/30 backdrop-blur-sm text-center relative overflow-hidden`}>
            
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-white/20 rounded-full scale-150 animate-pulse" />
            </div>

            {/* Main emoji */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1,
                rotate: 0,
                y: [0, -10, 0]
              }}
              transition={{
                scale: { delay: 0.3, type: "spring", damping: 10 },
                rotate: { delay: 0.3, duration: 0.8 },
                y: { delay: 1, duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="text-8xl mb-6 inline-block"
            >
              {celebrationData.emoji}
            </motion.div>

            {/* Content */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <h1 className="text-3xl font-bold text-white mb-4">
                    {celebrationData.title}
                  </h1>
                  <p className="text-white/90 text-lg leading-relaxed mb-6">
                    {celebrationData.message}
                  </p>

                  {/* Stats if provided */}
                  {celebration.stats && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 }}
                      className="bg-white/20 rounded-2xl p-4 mb-6 backdrop-blur-sm"
                    >
                      {Object.entries(celebration.stats).map(([key, value]) => (
                        <div key={key} className="text-white/90">
                          <span className="capitalize">{key.replace('_', ' ')}</span>: 
                          <span className="font-bold ml-2">{value}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Action button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="bg-white/20 text-white py-3 px-8 rounded-2xl font-bold text-lg backdrop-blur-sm border-2 border-white/30 hover:bg-white/30 transition-all duration-200"
                  >
                    Keep Going! 🚀
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sparkle effects */}
            <div className="absolute top-4 right-4 text-2xl animate-pulse">✨</div>
            <div className="absolute bottom-4 left-4 text-2xl animate-pulse delay-500">⭐</div>
            <div className="absolute top-1/2 left-4 text-xl animate-pulse delay-1000">💫</div>
            <div className="absolute top-4 left-1/2 text-xl animate-pulse delay-700">🌟</div>
          </div>

          {/* Pulsing rings */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.2, 1.4],
              opacity: [0.8, 0.4, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${celebrationData.color} -z-10`}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Hook for managing celebrations
export function useCelebrations() {
  const [currentCelebration, setCurrentCelebration] = useState(null)
  const [celebrationQueue, setCelebrationQueue] = useState([])

  const showCelebration = (type, value, stats = null) => {
    const celebration = { type, value, stats, id: Date.now() + Math.random() }
    
    if (currentCelebration) {
      // Queue it if one is already showing
      setCelebrationQueue(prev => [...prev, celebration])
    } else {
      // Show immediately
      setCurrentCelebration(celebration)
    }
  }

  const closeCelebration = () => {
    setCurrentCelebration(null)
    
    // Show next in queue
    setTimeout(() => {
      setCelebrationQueue(prev => {
        if (prev.length > 0) {
          const [next, ...rest] = prev
          setCurrentCelebration(next)
          return rest
        }
        return prev
      })
    }, 500)
  }

  const clearQueue = () => {
    setCurrentCelebration(null)
    setCelebrationQueue([])
  }

  return {
    currentCelebration,
    showCelebration,
    closeCelebration,
    clearQueue,
    queueLength: celebrationQueue.length,
    CelebrationComponent: () => (
      <CelebrationModal
        celebration={currentCelebration}
        isVisible={!!currentCelebration}
        onClose={closeCelebration}
      />
    )
  }
}