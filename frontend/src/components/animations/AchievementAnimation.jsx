import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ACHIEVEMENT_TYPES = {
  badge: {
    icon: '🏆',
    colors: 'from-yellow-400 to-orange-500',
    particles: ['✨', '🌟', '⭐', '💫'],
    duration: 4000
  },
  streak: {
    icon: '🔥',
    colors: 'from-orange-400 to-red-500',
    particles: ['🔥', '⚡', '💥', '🌟'],
    duration: 3000
  },
  level: {
    icon: '🚀',
    colors: 'from-purple-400 to-pink-500',
    particles: ['🎉', '🎊', '✨', '🌟'],
    duration: 5000
  },
  milestone: {
    icon: '🎯',
    colors: 'from-green-400 to-blue-500',
    particles: ['🎊', '🎉', '⭐', '💫'],
    duration: 4000
  },
  comeback: {
    icon: '💪',
    colors: 'from-indigo-400 to-purple-500',
    particles: ['💪', '🔥', '⚡', '🌟'],
    duration: 3500
  }
}

function Particle({ emoji, delay, duration }) {
  const randomX = Math.random() * 300 - 150
  const randomY = Math.random() * 200 - 100
  const randomRotation = Math.random() * 360

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        scale: 0,
        x: 0,
        y: 0,
        rotate: 0
      }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1.2, 1, 0],
        x: randomX,
        y: randomY,
        rotate: randomRotation
      }}
      transition={{ 
        duration: duration / 1000,
        delay: delay / 1000,
        ease: "easeOut"
      }}
      className="absolute text-2xl pointer-events-none"
    >
      {emoji}
    </motion.div>
  )
}

function ConfettiExplosion({ count = 20, duration = 3000 }) {
  const particles = Array.from({ length: count }, (_, i) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
    return {
      id: i,
      color: colors[Math.random() * colors.length | 0],
      delay: Math.random() * 1000
    }
  })

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          initial={{ 
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            rotate: 0
          }}
          animate={{
            opacity: 0,
            scale: 0,
            x: Math.random() * 400 - 200,
            y: Math.random() * 300 - 150,
            rotate: Math.random() * 720
          }}
          transition={{
            duration: duration / 1000,
            delay: particle.delay / 1000,
            ease: "easeOut"
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: particle.color,
            left: '50%',
            top: '50%'
          }}
        />
      ))}
    </div>
  )
}

export default function AchievementAnimation({ 
  achievement, 
  isVisible, 
  onComplete 
}) {
  const [showParticles, setShowParticles] = useState(false)

  const achievementType = ACHIEVEMENT_TYPES[achievement?.type] || ACHIEVEMENT_TYPES.badge

  useEffect(() => {
    if (isVisible) {
      setShowParticles(true)
      const timer = setTimeout(() => {
        onComplete?.()
      }, achievementType.duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete, achievementType.duration])

  if (!isVisible || !achievement) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        {/* Background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"
        />

        {/* Main achievement display */}
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0,
            y: 50
          }}
          animate={{ 
            opacity: 1, 
            scale: [0, 1.2, 1],
            y: 0,
            rotate: [0, -5, 5, 0]
          }}
          exit={{ 
            opacity: 0, 
            scale: 0,
            y: -50
          }}
          transition={{ 
            duration: 0.8,
            ease: "easeOut"
          }}
          className="relative z-10 text-center"
        >
          {/* Achievement card */}
          <div className={`bg-gradient-to-br ${achievementType.colors} p-8 rounded-3xl shadow-2xl border-4 border-white/20 backdrop-blur-sm`}>
            {/* Achievement icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-8xl mb-4"
            >
              {achievementType.icon}
            </motion.div>

            {/* Achievement text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                {achievement.title}
              </h1>
              <p className="text-white/90 text-lg">
                {achievement.description}
              </p>
            </motion.div>
          </div>

          {/* Floating particles */}
          {showParticles && (
            <div className="absolute inset-0">
              {achievementType.particles.map((particle, index) => (
                <Particle
                  key={`${particle}-${index}`}
                  emoji={particle}
                  delay={index * 200}
                  duration={achievementType.duration * 0.8}
                />
              ))}
            </div>
          )}

          {/* Confetti explosion */}
          {showParticles && (
            <ConfettiExplosion 
              count={30} 
              duration={achievementType.duration}
            />
          )}
        </motion.div>

        {/* Pulsing rings */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [1, 2, 3],
            opacity: [0.8, 0.4, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
          className={`absolute w-40 h-40 rounded-full bg-gradient-to-r ${achievementType.colors} opacity-20`}
        />
        
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [1, 2.5, 4],
            opacity: [0.6, 0.3, 0]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5
          }}
          className={`absolute w-40 h-40 rounded-full bg-gradient-to-r ${achievementType.colors} opacity-20`}
        />
      </div>
    </AnimatePresence>
  )
}

// Achievement queue manager
export class AchievementQueue {
  constructor() {
    this.queue = []
    this.isPlaying = false
    this.onUpdate = null
  }

  add(achievement) {
    this.queue.push({
      ...achievement,
      id: Date.now() + Math.random()
    })
    this.playNext()
  }

  playNext() {
    if (this.isPlaying || this.queue.length === 0) return

    this.isPlaying = true
    const achievement = this.queue.shift()
    
    this.onUpdate?.(achievement)
  }

  complete() {
    this.isPlaying = false
    this.onUpdate?.(null)
    
    // Play next achievement if any
    setTimeout(() => {
      this.playNext()
    }, 500)
  }

  setUpdateHandler(handler) {
    this.onUpdate = handler
  }
}

// Hook for managing achievements
export function useAchievements() {
  const [currentAchievement, setCurrentAchievement] = useState(null)
  const [queue] = useState(() => new AchievementQueue())

  useEffect(() => {
    queue.setUpdateHandler(setCurrentAchievement)
  }, [queue])

  const showAchievement = (type, title, description) => {
    queue.add({ type, title, description })
  }

  const completeAchievement = () => {
    queue.complete()
  }

  return {
    currentAchievement,
    showAchievement,
    completeAchievement,
    AchievementComponent: () => (
      <AchievementAnimation
        achievement={currentAchievement}
        isVisible={!!currentAchievement}
        onComplete={completeAchievement}
      />
    )
  }
}