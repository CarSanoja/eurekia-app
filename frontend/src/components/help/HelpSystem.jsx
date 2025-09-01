import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const HELP_TOPICS = {
  'getting-started': {
    title: 'Getting Started 🚀',
    emoji: '🌟',
    sections: [
      {
        question: 'What is Eurekia?',
        answer: 'Eurekia is your personal habit-building companion! Think of it as a game where you level up by completing daily quests (habits). Every day you complete your habits, you build streaks, earn badges, and become stronger! 💪'
      },
      {
        question: 'How do I create my first habit?',
        answer: 'Go to the Habits page and tap the "New Quest" button! Start with something small like "drink a glass of water" or "read for 5 minutes." Small wins lead to big changes! 🎯'
      },
      {
        question: 'What are streaks?',
        answer: 'Streaks are like your winning streak in a game! Every day you complete a habit, your streak grows. The longer your streak, the more XP you earn and the stronger you become! 🔥'
      }
    ]
  },
  'habits': {
    title: 'Habits & Quests 🎮',
    emoji: '⚡',
    sections: [
      {
        question: 'How do I complete a habit?',
        answer: 'On your habit card, tap the green "Complete" button! You can add notes about how it went. Each completion builds your streak and earns you XP! ✅'
      },
      {
        question: 'What is habit insurance?',
        answer: 'Insurance protects your streak! You earn insurance points by maintaining long streaks. If you miss a day, you can use insurance to keep your streak alive. It\'s like a second chance! 🛡️'
      },
      {
        question: 'What are difficulty levels?',
        answer: '🟢 Easy habits are simple daily tasks. 🟡 Medium habits require more effort. 🔴 Hard habits are challenging but give more XP! Start easy and level up! 💯'
      },
      {
        question: 'Can I edit or delete habits?',
        answer: 'Yes! Tap the 🎯 icon on any habit card to see details and options. You can edit the habit or pause it if needed. Remember, consistency matters more than perfection! 📝'
      }
    ]
  },
  'progress': {
    title: 'Progress & Stats 📊',
    emoji: '📈',
    sections: [
      {
        question: 'How do I track my progress?',
        answer: 'Visit the Progress page to see your stats! You\'ll see completion rates, streak graphs, and your habit calendar. It\'s like your game dashboard! 📊'
      },
      {
        question: 'What are badges?',
        answer: 'Badges are achievements you unlock! Complete streaks, hit milestones, or master habits to earn badges. Each badge shows how awesome you\'re becoming! 🏆'
      },
      {
        question: 'How is my consistency score calculated?',
        answer: 'Your consistency score combines your completion rate and active streaks. The more consistent you are, the higher your score. Aim for 80%+ to become a Habit Hero! 🌟'
      }
    ]
  },
  'features': {
    title: 'Cool Features 🔥',
    emoji: '✨',
    sections: [
      {
        question: 'What is the mood tracker?',
        answer: 'Track how you feel each day! Your mood helps us understand how habits affect your wellbeing. Happy habits = happy you! 😊'
      },
      {
        question: 'What are AI reports?',
        answer: 'Our AI analyzes your progress and creates personalized reports! Get insights on your habits, celebrate wins, and discover areas to improve. It\'s like having a personal coach! 🤖'
      },
      {
        question: 'How do notifications work?',
        answer: 'You can get reminders via email to stay on track with your habits. Set your preferences in Settings to choose when and how you want to be reminded! 📧'
      }
    ]
  },
  'troubleshooting': {
    title: 'Need Help? 🤔',
    emoji: '🔧',
    sections: [
      {
        question: 'My streak disappeared! What happened?',
        answer: 'Don\'t panic! Check if you have insurance available - you might be able to restore it. If not, remember that every expert has failed more times than beginners have tried. Start again! 💪'
      },
      {
        question: 'I can\'t complete a habit',
        answer: 'Make sure you\'re connected to the internet. If the problem continues, try refreshing the page. Remember, missing one day doesn\'t ruin your progress - just get back to it tomorrow! 🔄'
      },
      {
        question: 'How do I reset my onboarding tour?',
        answer: 'Want to see the tour again? Go to Settings and look for the "Reset Tutorial" option. You can replay the onboarding anytime! 🎓'
      }
    ]
  }
}

function HelpSearch({ searchTerm, setSearchTerm, searchResults }) {
  return (
    <div className="mb-6">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for help... 🔍"
          className="w-full p-4 pr-12 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl">
          🔍
        </div>
      </div>
      
      {searchTerm && searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-white rounded-xl shadow-lg border border-purple-100 p-4"
        >
          <h3 className="font-bold text-gray-800 mb-3">Search Results:</h3>
          <div className="space-y-3">
            {searchResults.map((result, index) => (
              <div key={index} className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-1">
                  {result.category} - {result.question}
                </h4>
                <p className="text-gray-700 text-sm">{result.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function HelpTopic({ topic, data, isExpanded, onToggle }) {
  return (
    <motion.div
      layout
      className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-purple-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="text-3xl">{data.emoji}</div>
          <h2 className="text-xl font-bold text-gray-800">{data.title}</h2>
        </div>
        <div className={`text-2xl transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ⬇️
        </div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-purple-100"
          >
            <div className="p-6 space-y-4">
              {data.sections.map((section, index) => (
                <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    ❓ {section.question}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {section.answer}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function HelpSystem({ isOpen, onClose }) {
  const [expandedTopic, setExpandedTopic] = useState('getting-started')
  const [searchTerm, setSearchTerm] = useState('')

  // Search functionality
  const searchResults = searchTerm.length > 2 ? 
    Object.entries(HELP_TOPICS).flatMap(([key, topic]) =>
      topic.sections
        .filter(section => 
          section.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          section.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(section => ({
          category: topic.title,
          ...section
        }))
    ).slice(0, 5) : []

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-purple-100 via-pink-50 to-white rounded-3xl p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🎓</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Help Center</h1>
              <p className="text-gray-600">Everything you need to become a Habit Hero!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Search */}
          <HelpSearch 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
          />

          {/* Help Topics */}
          {!searchTerm && (
            <div className="space-y-4">
              {Object.entries(HELP_TOPICS).map(([key, topic]) => (
                <HelpTopic
                  key={key}
                  topic={key}
                  data={topic}
                  isExpanded={expandedTopic === key}
                  onToggle={() => setExpandedTopic(expandedTopic === key ? null : key)}
                />
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-bold mb-3">Still need help? 💬</h3>
            <p className="mb-4">We're here to support your journey!</p>
            <div className="flex gap-3">
              <button className="bg-white/20 text-white py-2 px-4 rounded-xl font-medium hover:bg-white/30 transition-colors">
                📧 Contact Support
              </button>
              <button 
                onClick={() => {
                  // Reset onboarding for all pages
                  Object.keys(HELP_TOPICS).forEach(page => {
                    localStorage.removeItem(`onboarding_${page}_seen`)
                  })
                  onClose()
                  setTimeout(() => window.location.reload(), 100)
                }}
                className="bg-white/20 text-white py-2 px-4 rounded-xl font-medium hover:bg-white/30 transition-colors"
              >
                🎯 Restart Tutorial
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Hook for help system
export function useHelp() {
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  const openHelp = () => setIsHelpOpen(true)
  const closeHelp = () => setIsHelpOpen(false)

  return {
    isHelpOpen,
    openHelp,
    closeHelp,
    HelpComponent: () => (
      <HelpSystem 
        isOpen={isHelpOpen}
        onClose={closeHelp}
      />
    )
  }
}