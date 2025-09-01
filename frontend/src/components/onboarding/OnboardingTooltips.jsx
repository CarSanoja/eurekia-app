import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Tooltip from '../ui/Tooltip'

const ONBOARDING_STEPS = {
  dashboard: [
    {
      id: 'hero-card',
      selector: '[data-onboarding="hero-card"]',
      title: 'Your Hero Journey! 🌟',
      content: 'This is your Hero Card! It shows your current level and progress. Complete habits to level up!',
      position: 'bottom',
      emoji: '🎯'
    },
    {
      id: 'habits-section',
      selector: '[data-onboarding="habits-section"]',
      title: 'Your Active Quests 🎮',
      content: 'These are your daily habits (quests)! Tap the green button to complete them and build streaks!',
      position: 'top',
      emoji: '⚡'
    },
    {
      id: 'mood-widget',
      selector: '[data-onboarding="mood-widget"]',
      title: 'Mood Check-in 😊',
      content: 'Track how you feel today! This helps us understand your progress better.',
      position: 'top',
      emoji: '💭'
    }
  ],
  habits: [
    {
      id: 'new-habit-button',
      selector: '[data-onboarding="new-habit-button"]',
      title: 'Create New Quest! ✨',
      content: 'Tap here to add a new habit. Start with something small and build from there!',
      position: 'bottom',
      emoji: '🚀'
    },
    {
      id: 'habit-card',
      selector: '[data-onboarding="habit-card"]',
      title: 'Your Habit Quest Card 🎯',
      content: 'Each habit has its own card with streak counters and completion buttons. Tap the emoji to see details!',
      position: 'top',
      emoji: '🔥'
    }
  ],
  progress: [
    {
      id: 'progress-stats',
      selector: '[data-onboarding="progress-stats"]',
      title: 'Your Progress Stats 📊',
      content: 'See how well you\'re doing! Track your streaks, completion rates, and consistency.',
      position: 'bottom',
      emoji: '📈'
    },
    {
      id: 'badges-section',
      selector: '[data-onboarding="badges-section"]',
      title: 'Achievement Badges 🏆',
      content: 'Earn badges as you hit milestones! Collect them all to become a true habit hero!',
      position: 'top',
      emoji: '🌟'
    }
  ]
}

function OnboardingTooltip({ step, onNext, onSkip, isLast }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Scroll element into view if needed
    const element = document.querySelector(step.selector)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      // Add highlight effect
      element.style.boxShadow = '0 0 20px 4px rgba(139, 92, 246, 0.3)'
      element.style.borderRadius = '12px'
      element.style.transition = 'all 0.3s ease'
      
      return () => {
        element.style.boxShadow = ''
      }
    }
  }, [step])

  if (!isVisible) return null

  const element = document.querySelector(step.selector)
  if (!element) return null

  const rect = element.getBoundingClientRect()
  const scrollY = window.scrollY

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onSkip} />
      
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="absolute bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4"
        style={{
          top: rect.bottom + scrollY + 16,
          left: Math.max(16, Math.min(rect.left, window.innerWidth - 400)),
          transform: step.position === 'top' ? 'translateY(-100%) translateY(-32px)' : 'none'
        }}
      >
        {/* Arrow */}
        <div 
          className={`absolute w-4 h-4 bg-white transform rotate-45 ${
            step.position === 'top' ? 'bottom-[-8px]' : 'top-[-8px]'
          }`}
          style={{ left: '24px' }}
        />
        
        <div className="text-center">
          <div className="text-4xl mb-3">{step.emoji}</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
          <p className="text-gray-600 mb-6">{step.content}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={onNext}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              {isLast ? 'Got it! 🎉' : 'Next'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function OnboardingTooltips({ page, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  
  const steps = ONBOARDING_STEPS[page] || []

  useEffect(() => {
    // Check if user has seen onboarding for this page
    const seenKey = `onboarding_${page}_seen`
    const hasSeenOnboarding = localStorage.getItem(seenKey)
    
    if (!hasSeenOnboarding && steps.length > 0) {
      // Wait a bit for page to load
      setTimeout(() => {
        setIsActive(true)
      }, 1000)
    }
  }, [page, steps.length])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsActive(false)
    localStorage.setItem(`onboarding_${page}_seen`, 'true')
    onComplete?.()
  }

  if (!isActive || steps.length === 0) return null

  const currentStepData = steps[currentStep]

  return (
    <AnimatePresence>
      {currentStepData && (
        <OnboardingTooltip
          key={currentStepData.id}
          step={currentStepData}
          onNext={handleNext}
          onSkip={handleSkip}
          isLast={currentStep === steps.length - 1}
        />
      )}
    </AnimatePresence>
  )
}

// Hook to manually trigger onboarding
export function useOnboarding() {
  const triggerOnboarding = (page) => {
    localStorage.removeItem(`onboarding_${page}_seen`)
    window.location.reload()
  }

  const resetAllOnboarding = () => {
    Object.keys(ONBOARDING_STEPS).forEach(page => {
      localStorage.removeItem(`onboarding_${page}_seen`)
    })
  }

  return {
    triggerOnboarding,
    resetAllOnboarding
  }
}