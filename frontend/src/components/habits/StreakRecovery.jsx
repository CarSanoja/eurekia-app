import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../utils/api'
import { playSound } from '../../utils/soundEffects'

const RECOVERY_OPTIONS = [
  {
    id: 'insurance',
    title: 'Use Streak Insurance 🛡️',
    description: 'Protect your streak! You earned this by maintaining long streaks.',
    emoji: '🛡️',
    color: 'from-blue-500 to-cyan-500',
    requirements: 'insurance_available'
  },
  {
    id: 'grace',
    title: 'Grace Period 💫',
    description: 'Everyone deserves a second chance! Use your one-time grace period.',
    emoji: '💫',
    color: 'from-purple-500 to-pink-500',
    requirements: 'grace_available'
  },
  {
    id: 'comeback',
    title: 'Comeback Story 💪',
    description: 'Turn this setback into your comeback! Start fresh with motivation.',
    emoji: '💪',
    color: 'from-orange-500 to-red-500',
    requirements: 'always'
  }
]

function RecoveryOption({ option, habit, onSelect, disabled }) {
  const canUse = option.requirements === 'always' || 
                 (option.requirements === 'insurance_available' && habit.insurance_available > 0) ||
                 (option.requirements === 'grace_available' && habit.grace_available > 0)

  return (
    <motion.button
      whileHover={canUse ? { scale: 1.02, y: -2 } : {}}
      whileTap={canUse ? { scale: 0.98 } : {}}
      onClick={() => canUse && onSelect(option)}
      disabled={disabled || !canUse}
      className={`relative w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
        canUse 
          ? `bg-gradient-to-br ${option.color} text-white border-white/30 shadow-lg hover:shadow-xl` 
          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{option.emoji}</div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{option.title}</h3>
          <p className={`text-sm mb-3 ${canUse ? 'text-white/90' : 'text-gray-500'}`}>
            {option.description}
          </p>
          
          {/* Requirements/status */}
          <div className="text-xs">
            {option.requirements === 'insurance_available' && (
              <span className={canUse ? 'text-white/80' : 'text-gray-400'}>
                {habit.insurance_available > 0 
                  ? `${habit.insurance_available} insurance points available`
                  : 'No insurance points available'
                }
              </span>
            )}
            {option.requirements === 'grace_available' && (
              <span className={canUse ? 'text-white/80' : 'text-gray-400'}>
                {habit.grace_available > 0 
                  ? 'Grace period available (one-time use)'
                  : 'Grace period already used'
                }
              </span>
            )}
            {option.requirements === 'always' && (
              <span className={canUse ? 'text-white/80' : 'text-gray-400'}>
                Always available
              </span>
            )}
          </div>
        </div>
      </div>

      {!canUse && (
        <div className="absolute inset-0 bg-gray-300/50 rounded-2xl flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-2">
            <div className="text-2xl">🔒</div>
          </div>
        </div>
      )}
    </motion.button>
  )
}

function ConfirmationDialog({ option, habit, onConfirm, onCancel, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 rounded-3xl"
    >
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{option.emoji}</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Confirm {option.title}
          </h3>
          <p className="text-gray-600 text-sm">
            Are you sure you want to use this recovery option for "{habit.title}"?
          </p>
        </div>

        {option.id === 'insurance' && (
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="text-xl">ℹ️</div>
              <div className="text-sm">
                <div className="font-semibold">Using 1 insurance point</div>
                <div>You'll have {habit.insurance_available - 1} points left</div>
              </div>
            </div>
          </div>
        )}

        {option.id === 'grace' && (
          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-purple-700">
              <div className="text-xl">⚠️</div>
              <div className="text-sm">
                <div className="font-semibold">One-time use only</div>
                <div>This grace period can't be used again</div>
              </div>
            </div>
          </div>
        )}

        {option.id === 'comeback' && (
          <div className="bg-orange-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-orange-700">
              <div className="text-xl">💪</div>
              <div className="text-sm">
                <div className="font-semibold">Fresh start</div>
                <div>Your streak will reset, but that's okay!</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 bg-gradient-to-r ${option.color} text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50`}
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function StreakRecovery({ habit, isOpen, onClose, onSuccess }) {
  const [selectedOption, setSelectedOption] = useState(null)
  const queryClient = useQueryClient()

  const recoveryMutation = useMutation({
    mutationFn: async (option) => {
      switch (option.id) {
        case 'insurance':
          const response = await api.post(`/habits/${habit.id}/insurance/`, {
            date: new Date().toISOString().split('T')[0]
          })
          return { type: 'insurance', data: response.data }
        
        case 'grace':
          // Implement grace period API call when backend supports it
          const graceResponse = await api.post(`/habits/${habit.id}/grace/`, {
            date: new Date().toISOString().split('T')[0]
          })
          return { type: 'grace', data: graceResponse.data }
        
        case 'comeback':
          // For comeback, just refresh the habit data and show motivational message
          return { type: 'comeback', data: { message: 'Ready for your comeback!' } }
        
        default:
          throw new Error('Invalid recovery option')
      }
    },
    onSuccess: (result) => {
      playSound.comeback()
      queryClient.invalidateQueries(['habits'])
      onSuccess?.(result)
      setSelectedOption(null)
      onClose()
    },
    onError: (error) => {
      playSound.error()
      console.error('Recovery failed:', error)
    }
  })

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
  }

  const handleConfirm = () => {
    if (selectedOption) {
      recoveryMutation.mutate(selectedOption)
    }
  }

  const handleCancel = () => {
    setSelectedOption(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gradient-to-br from-purple-100 via-pink-50 to-white rounded-3xl p-6 w-full max-w-md relative"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔄</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Streak Recovery
          </h1>
          <p className="text-gray-600">
            Don't worry! Everyone has off days. Let's get you back on track! 💪
          </p>
        </div>

        {/* Habit info */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h3 className="font-semibold text-gray-800">{habit.title}</h3>
              <p className="text-sm text-gray-600">
                Current streak: {habit.current_streak} days
              </p>
            </div>
          </div>
        </div>

        {/* Recovery options */}
        <div className="space-y-4 mb-6">
          {RECOVERY_OPTIONS.map((option) => (
            <RecoveryOption
              key={option.id}
              option={option}
              habit={habit}
              onSelect={handleOptionSelect}
              disabled={recoveryMutation.isPending}
            />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          disabled={recoveryMutation.isPending}
          className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Maybe Later
        </button>

        {/* Confirmation dialog */}
        <AnimatePresence>
          {selectedOption && (
            <ConfirmationDialog
              option={selectedOption}
              habit={habit}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              isLoading={recoveryMutation.isPending}
            />
          )}
        </AnimatePresence>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </motion.div>
    </div>
  )
}

// Hook for streak recovery
export function useStreakRecovery() {
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false)
  const [recoveryHabit, setRecoveryHabit] = useState(null)

  const openRecovery = (habit) => {
    setRecoveryHabit(habit)
    setIsRecoveryOpen(true)
  }

  const closeRecovery = () => {
    setIsRecoveryOpen(false)
    setRecoveryHabit(null)
  }

  return {
    isRecoveryOpen,
    recoveryHabit,
    openRecovery,
    closeRecovery,
    RecoveryComponent: ({ onSuccess }) => (
      <StreakRecovery
        habit={recoveryHabit}
        isOpen={isRecoveryOpen}
        onClose={closeRecovery}
        onSuccess={onSuccess}
      />
    )
  }
}