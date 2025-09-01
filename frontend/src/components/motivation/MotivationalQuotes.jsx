import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const QUOTE_CATEGORIES = {
  morning: {
    emoji: '🌅',
    title: 'Morning Motivation',
    quotes: [
      { text: "Today is a blank page. You get to write the story!", author: "Habit Hero", emoji: "📝" },
      { text: "Every morning you have two choices: continue to sleep with your dreams or wake up and chase them!", author: "Habit Hero", emoji: "🚀" },
      { text: "The secret to getting ahead is getting started!", author: "Mark Twain", emoji: "⚡" },
      { text: "Your future is created by what you do today, not tomorrow.", author: "Habit Hero", emoji: "🌟" },
      { text: "Small steps every day lead to big changes every year!", author: "Habit Hero", emoji: "👣" }
    ]
  },
  streak: {
    emoji: '🔥',
    title: 'Streak Power',
    quotes: [
      { text: "Consistency is the mother of mastery!", author: "Robin Sharma", emoji: "🎯" },
      { text: "You don't have to be great to get started, but you have to get started to be great!", author: "Les Brown", emoji: "🌟" },
      { text: "Every streak starts with a single day. Every master starts with a single practice!", author: "Habit Hero", emoji: "🔥" },
      { text: "The difference between ordinary and extraordinary is that little 'extra'!", author: "Jimmy Johnson", emoji: "⚡" },
      { text: "Your streak is proof that you can do hard things!", author: "Habit Hero", emoji: "💪" }
    ]
  },
  motivation: {
    emoji: '💪',
    title: 'Daily Motivation',
    quotes: [
      { text: "You are stronger than you think and braver than you feel!", author: "Habit Hero", emoji: "🦁" },
      { text: "Progress, not perfection, is the goal!", author: "Habit Hero", emoji: "📈" },
      { text: "Every expert was once a beginner. Keep going!", author: "Habit Hero", emoji: "🌱" },
      { text: "Your only competition is who you were yesterday!", author: "Habit Hero", emoji: "🏆" },
      { text: "Believe you can and you're halfway there!", author: "Theodore Roosevelt", emoji: "🌟" }
    ]
  },
  comeback: {
    emoji: '🌈',
    title: 'Comeback Strength',
    quotes: [
      { text: "It's not about how many times you fall, but how many times you get back up!", author: "Habit Hero", emoji: "💪" },
      { text: "Every comeback starts with a come-back-to-yourself moment!", author: "Habit Hero", emoji: "🔄" },
      { text: "Resilience is your superpower!", author: "Habit Hero", emoji: "⚡" },
      { text: "The best view comes after the hardest climb!", author: "Habit Hero", emoji: "🏔️" },
      { text: "Your comeback is always stronger than your setback!", author: "Habit Hero", emoji: "🚀" }
    ]
  },
  celebration: {
    emoji: '🎉',
    title: 'Celebration Time',
    quotes: [
      { text: "Look how far you've come! You should be proud!", author: "Habit Hero", emoji: "🌟" },
      { text: "Success is a series of small wins!", author: "Habit Hero", emoji: "🏆" },
      { text: "You're not just building habits, you're building character!", author: "Habit Hero", emoji: "💎" },
      { text: "Every completion is a victory! Celebrate it!", author: "Habit Hero", emoji: "🎊" },
      { text: "You're becoming the person you always wanted to be!", author: "Habit Hero", emoji: "🦸" }
    ]
  },
  evening: {
    emoji: '🌙',
    title: 'Evening Reflection',
    quotes: [
      { text: "Today's efforts are tomorrow's results!", author: "Habit Hero", emoji: "🌟" },
      { text: "Rest well, you've earned it!", author: "Habit Hero", emoji: "😴" },
      { text: "Reflect on your wins, learn from your challenges, and dream of tomorrow!", author: "Habit Hero", emoji: "💭" },
      { text: "Every day you don't give up is a day you win!", author: "Habit Hero", emoji: "🏆" },
      { text: "You're building something amazing, one day at a time!", author: "Habit Hero", emoji: "🏗️" }
    ]
  }
}

function QuoteCard({ quote, category, onClose }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9, y: isVisible ? 0 : 20 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px] rounded-3xl shadow-2xl"
    >
      <div className="bg-white rounded-3xl p-6 text-center relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>

        {/* Category header */}
        <div className="mb-4">
          <div className="text-4xl mb-2">{category.emoji}</div>
          <h3 className="text-lg font-semibold text-gray-700">{category.title}</h3>
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-4xl mb-4">{quote.emoji}</div>
          <blockquote className="text-xl font-medium text-gray-800 leading-relaxed mb-4">
            "{quote.text}"
          </blockquote>
          <cite className="text-sm text-gray-600 font-semibold">
            — {quote.author}
          </cite>
        </motion.div>

        {/* Action button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-8 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Let's Go! 🚀
        </motion.button>
      </div>
    </motion.div>
  )
}

function FloatingQuoteWidget({ quote, category, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed bottom-20 right-4 z-40 max-w-xs"
    >
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg text-white text-sm">
        <div className="flex items-start justify-between mb-2">
          <div className="text-2xl mr-2">{quote.emoji}</div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-lg"
          >
            ×
          </button>
        </div>
        <p className="font-medium mb-2">"{quote.text}"</p>
        <p className="text-white/80 text-xs">— {quote.author}</p>
      </div>
    </motion.div>
  )
}

export default function MotivationalQuotes({ 
  isOpen, 
  onClose, 
  category = 'motivation',
  widget = false,
  autoClose = true,
  duration = 8000
}) {
  const [currentQuote, setCurrentQuote] = useState(null)
  const [showQuote, setShowQuote] = useState(false)

  useEffect(() => {
    if (isOpen && QUOTE_CATEGORIES[category]) {
      const quotes = QUOTE_CATEGORIES[category].quotes
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      setCurrentQuote(randomQuote)
      setShowQuote(true)

      if (autoClose) {
        const timer = setTimeout(() => {
          setShowQuote(false)
          setTimeout(onClose, 300)
        }, duration)

        return () => clearTimeout(timer)
      }
    }
  }, [isOpen, category, autoClose, duration, onClose])

  if (!isOpen || !currentQuote) return null

  const categoryData = QUOTE_CATEGORIES[category]

  if (widget) {
    return (
      <AnimatePresence>
        {showQuote && (
          <FloatingQuoteWidget
            quote={currentQuote}
            category={categoryData}
            onClose={onClose}
          />
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <AnimatePresence>
        {showQuote && (
          <QuoteCard
            quote={currentQuote}
            category={categoryData}
            onClose={onClose}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Quote scheduler for different times of day
export class QuoteScheduler {
  constructor() {
    this.listeners = []
    this.schedule = {
      morning: { start: 6, end: 12 },
      afternoon: { start: 12, end: 18 },
      evening: { start: 18, end: 22 }
    }
  }

  getCurrentTimeCategory() {
    const hour = new Date().getHours()
    
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'motivation'
    if (hour >= 18 && hour < 22) return 'evening'
    return 'motivation'
  }

  getContextualCategory(context = {}) {
    const { hasStreak, isComeback, justCompleted, currentStreak } = context
    
    if (justCompleted && currentStreak > 0) return 'celebration'
    if (isComeback) return 'comeback'
    if (hasStreak) return 'streak'
    
    return this.getCurrentTimeCategory()
  }

  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  trigger(context = {}) {
    const category = this.getContextualCategory(context)
    this.listeners.forEach(callback => callback(category))
  }
}

// Hook for motivational quotes
export function useMotivationalQuotes() {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)
  const [quoteCategory, setQuoteCategory] = useState('motivation')
  const [isWidget, setIsWidget] = useState(false)
  const [scheduler] = useState(() => new QuoteScheduler())

  const showQuote = (category = null, asWidget = false) => {
    setQuoteCategory(category || scheduler.getCurrentTimeCategory())
    setIsWidget(asWidget)
    setIsQuoteOpen(true)
  }

  const closeQuote = () => {
    setIsQuoteOpen(false)
  }

  const showContextualQuote = (context, asWidget = false) => {
    const category = scheduler.getContextualCategory(context)
    showQuote(category, asWidget)
  }

  // Auto-schedule based on habits
  useEffect(() => {
    return scheduler.subscribe((category) => {
      showQuote(category, true) // Show as widget
    })
  }, [scheduler])

  return {
    isQuoteOpen,
    quoteCategory,
    showQuote,
    closeQuote,
    showContextualQuote,
    scheduler,
    QuoteComponent: (props = {}) => (
      <MotivationalQuotes
        isOpen={isQuoteOpen}
        onClose={closeQuote}
        category={quoteCategory}
        widget={isWidget}
        {...props}
      />
    )
  }
}