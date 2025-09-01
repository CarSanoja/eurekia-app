import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import StreakDisplay from '../components/habits/StreakDisplay'
import InsuranceButton from '../components/habits/InsuranceButton'
import StreakMilestones from '../components/habits/StreakMilestones'
import ComebackBanner from '../components/habits/ComebackBanner'
import MotivationalMessage from '../components/habits/MotivationalMessage'
import { 
  checkStreakMilestones, 
  checkInsuranceMilestones,
  showComebackCelebration,
  showFirstCompletionCelebration 
} from '../utils/streakNotifications'

// Habit Card Component
function HabitCard({ habit, onCheckin, onHabitUpdate }) {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const [note, setNote] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [habitData, setHabitData] = useState(habit)

  const checkinMutation = useMutation({
    mutationFn: async ({ habitId, value, note }) => {
      const response = await api.post(`/habits/${habitId}/checkins/`, {
        value,
        note,
        date: new Date().toISOString().split('T')[0]
      })
      return response.data
    },
    onSuccess: (data) => {
      setIsCheckedIn(true)
      setShowNote(false)
      setNote('')
      // Refresh habit data to get updated streak info
      refreshHabitData()
      onCheckin()
    }
  })

  const refreshHabitData = async () => {
    try {
      const previousStreak = habitData.current_streak || 0;
      const previousInsurance = habitData.insurance_available || 0;
      
      const response = await api.get(`/habits/${habit.id}/`)
      const newHabitData = response.data;
      
      // Check for streak milestones
      if (newHabitData.current_streak > previousStreak) {
        checkStreakMilestones(previousStreak, newHabitData.current_streak, newHabitData.title);
        
        // Show first completion celebration
        if (previousStreak === 0 && newHabitData.current_streak === 1) {
          showFirstCompletionCelebration(newHabitData.title);
        }
        
        // Show comeback celebration
        if (newHabitData.comeback_status?.is_comeback && previousStreak === 0) {
          showComebackCelebration(
            newHabitData.title, 
            newHabitData.comeback_status.days_since_last
          );
        }
      }
      
      // Check for insurance milestones
      checkInsuranceMilestones(previousInsurance, newHabitData.insurance_available || 0);
      
      setHabitData(newHabitData)
      onHabitUpdate?.(newHabitData)
    } catch (error) {
      console.error('Failed to refresh habit data:', error)
    }
  }

  const handleInsuranceUsed = (data) => {
    // Update habit data with new insurance info
    setHabitData(prev => ({
      ...prev,
      insurance_available: data.insurance_available,
      current_streak: data.current_streak
    }))
    onHabitUpdate?.(data)
  }

  const handleCheckin = (completed) => {
    if (completed && !showNote) {
      setShowNote(true)
      return
    }
    checkinMutation.mutate({ 
      habitId: habit.id, 
      value: completed, 
      note: completed ? note : '' 
    })
  }

  const difficultyEmoji = {
    1: '🟢',
    2: '🟡', 
    3: '🔴'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-all duration-200 overflow-hidden">
      {/* Main Card Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">{habitData.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span>{difficultyEmoji[habitData.difficulty_level]} {habitData.cadence}</span>
              <span>🔥 {habitData.current_streak || 0} day streak</span>
              {habitData.insurance_available > 0 && (
                <InsuranceButton 
                  habit={habitData} 
                  onInsuranceUsed={handleInsuranceUsed}
                  compact={true}
                />
              )}
            </div>
            {habitData.anchor && (
              <p className="text-sm text-gray-600 italic">
                📍 {habitData.anchor}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-2xl hover:scale-110 transition-transform duration-200"
          >
            {showDetails ? '📊' : '🎯'}
          </button>
        </div>

        {/* Streak Display - Compact Version */}
        {!showDetails && habitData.current_streak > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-xl border border-orange-200">
              <div className="text-2xl animate-pulse">🔥</div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">Current Streak</div>
                <div className="font-bold text-orange-600">{habitData.current_streak} days</div>
              </div>
              {habitData.streak_stats?.longest_streak > habitData.current_streak && (
                <div className="text-right text-xs text-gray-500">
                  Best: {habitData.streak_stats.longest_streak} days
                </div>
              )}
            </div>
          </div>
        )}

        {showNote && (
          <div className="mb-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did it go? Any notes? 📝"
              className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={2}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <button
              onClick={() => handleCheckin(true)}
              disabled={checkinMutation.isPending || isCheckedIn}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {checkinMutation.isPending ? '⏳' : isCheckedIn ? '✅ Done!' : '✅ Complete'}
            </button>
            <button
              onClick={() => handleCheckin(false)}
              disabled={checkinMutation.isPending || isCheckedIn}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 disabled:opacity-50"
            >
              Skip Today
            </button>
          </div>

          {/* Insurance Button - Full Version */}
          {!isCheckedIn && habitData.can_use_insurance && habitData.insurance_available > 0 && (
            <InsuranceButton 
              habit={habitData} 
              onInsuranceUsed={handleInsuranceUsed}
              compact={false}
            />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="border-t border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-6 space-y-6">
          {/* Full Streak Display */}
          <StreakDisplay habit={habitData} />
          
          {/* Streak Milestones */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              🏆 Progress Milestones
            </h4>
            <StreakMilestones habit={habitData} />
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setShowDetails(false)}
            className="w-full bg-white/50 text-purple-600 py-2 rounded-xl font-medium hover:bg-white/70 transition-colors"
          >
            ⬆️ Collapse
          </button>
        </div>
      )}
    </div>
  )
}

// Add Habit Form
function AddHabitForm({ isOpen, onClose, onSuccess }) {
  const [title, setTitle] = useState('')
  const [cadence, setCadence] = useState('daily')
  const [difficulty, setDifficulty] = useState(1)
  const [anchor, setAnchor] = useState('')

  const addHabitMutation = useMutation({
    mutationFn: async (habitData) => {
      const response = await api.post('/habits/', habitData)
      return response.data
    },
    onSuccess: () => {
      onSuccess()
      onClose()
      setTitle('')
      setAnchor('')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    addHabitMutation.mutate({
      title,
      cadence,
      difficulty_level: difficulty,
      anchor
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">New Quest! 🎯</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What's your quest? ⚡
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Read 15 minutes, Exercise, Drink water..."
              className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              How often? 📅
            </label>
            <select
              value={cadence}
              onChange={(e) => setCadence(e.target.value)}
              className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="daily">Every Day 🌟</option>
              <option value="weekly">Once a Week 📝</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Difficulty Level 🎮
            </label>
            <div className="flex gap-2">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all duration-200 ${
                    difficulty === level
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-purple-300'
                  }`}
                >
                  {level === 1 && '🟢 Easy'}
                  {level === 2 && '🟡 Medium'}
                  {level === 3 && '🔴 Hard'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              When/where will you do it? 📍 (Optional)
            </label>
            <input
              type="text"
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              placeholder="e.g., After breakfast, Before bed, At the gym..."
              className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addHabitMutation.isPending || !title.trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {addHabitMutation.isPending ? 'Creating...' : 'Start Quest! 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function HabitsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)

  const { data: habits = [], isLoading, refetch } = useQuery({
    queryKey: ['habits'],
    queryFn: async () => {
      const response = await api.get('/habits/')
      return response.data
    }
  })

  const handleCheckinSuccess = () => {
    queryClient.invalidateQueries(['habits'])
    queryClient.invalidateQueries(['dashboard'])
  }

  const handleAddSuccess = () => {
    refetch()
    queryClient.invalidateQueries(['dashboard'])
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎯</div>
          <h2 className="text-xl font-bold text-gray-800">Loading your quests...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Your Quests 🎯</h1>
              <p className="text-gray-600">
                {habits.length} active {habits.length === 1 ? 'quest' : 'quests'}
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              + New Quest
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Comeback Banners */}
        {habits.some(habit => habit.comeback_status?.is_comeback) && (
          <div className="space-y-3">
            {habits
              .filter(habit => habit.comeback_status?.is_comeback)
              .slice(0, 1) // Show only the most relevant comeback banner
              .map(habit => (
                <ComebackBanner
                  key={`comeback-${habit.id}`}
                  comeback_status={habit.comeback_status}
                  motivational_message={habit.motivational_message}
                />
              ))
            }
          </div>
        )}

        {/* Daily Motivational Messages */}
        {habits.length > 0 && !habits.some(habit => habit.comeback_status?.is_comeback) && (
          <div className="space-y-2">
            {habits
              .filter(habit => habit.current_streak > 0)
              .slice(0, 1) // Show one motivational message
              .map(habit => (
                <MotivationalMessage
                  key={`motivation-${habit.id}`}
                  message={habit.motivational_message}
                  type={habit.current_streak >= 7 ? 'streak' : 'default'}
                />
              ))
            }
          </div>
        )}

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">🎯</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Ready for your first quest?
            </h2>
            <p className="text-gray-600 mb-8">
              Start building awesome habits that will make you stronger every day! 💪
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Your First Quest! 🚀
            </button>
          </div>
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onCheckin={handleCheckinSuccess}
            />
          ))
        )}
      </div>

      {/* Add Habit Modal */}
      <AddHabitForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  )
}