import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const questTemplates = [
  { 
    icon: '💧', 
    title: 'Hydration Hero', 
    habit: 'Drink 8 glasses of water daily',
    description: 'Become a water-powered superhero!',
    color: 'from-blue-400 to-cyan-500',
    xp: 10
  },
  { 
    icon: '📚', 
    title: 'Knowledge Seeker', 
    habit: 'Read for 30 minutes daily',
    description: 'Unlock the power of knowledge!',
    color: 'from-green-400 to-emerald-500',
    xp: 15
  },
  { 
    icon: '💪', 
    title: 'Fitness Fighter', 
    habit: 'Exercise for 20 minutes daily',
    description: 'Build your physical superpowers!',
    color: 'from-red-400 to-pink-500',
    xp: 20
  },
  { 
    icon: '🧘', 
    title: 'Zen Master', 
    habit: 'Meditate for 10 minutes daily',
    description: 'Master the art of inner peace!',
    color: 'from-purple-400 to-indigo-500',
    xp: 15
  },
  { 
    icon: '🎨', 
    title: 'Creative Genius', 
    habit: 'Create art for 15 minutes daily',
    description: 'Express your artistic superpowers!',
    color: 'from-yellow-400 to-orange-500',
    xp: 15
  },
  { 
    icon: '🌱', 
    title: 'Garden Guardian', 
    habit: 'Take care of plants daily',
    description: 'Nurture life and grow with nature!',
    color: 'from-green-500 to-lime-400',
    xp: 10
  }
]

const difficultyLevels = [
  { level: 'easy', label: 'Easy Peasy! 😄', xpMultiplier: 1, color: 'bg-green-500' },
  { level: 'medium', label: 'Challenge Me! 🔥', xpMultiplier: 1.5, color: 'bg-yellow-500' },
  { level: 'hard', label: 'Epic Mode! 💪', xpMultiplier: 2, color: 'bg-red-500' }
]

export default function HabitQuestCreator({ isOpen, onClose, onHabitCreated }) {
  const { token } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [customHabit, setCustomHabit] = useState('')
  const [difficulty, setDifficulty] = useState('easy')
  const [isCustom, setIsCustom] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleCreateHabit = async () => {
    const habitTitle = isCustom ? customHabit : selectedTemplate?.habit
    
    if (!habitTitle) {
      toast.error('Please choose a quest or create a custom one!')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/habits/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: habitTitle,
          difficulty_level: difficulty,
          cadence: 'daily'
        })
      })

      if (response.ok) {
        const habit = await response.json()
        toast.success('🎉 Quest accepted! Let the adventure begin!')
        onHabitCreated(habit)
        onClose()
        // Reset form
        setSelectedTemplate(null)
        setCustomHabit('')
        setDifficulty('easy')
        setIsCustom(false)
      } else {
        throw new Error('Failed to create habit')
      }
    } catch (error) {
      console.error('Error creating habit:', error)
      toast.error('Oops! Something went wrong. Let\'s try again!')
    } finally {
      setLoading(false)
    }
  }

  const selectedDifficulty = difficultyLevels.find(d => d.level === difficulty)
  const baseXP = isCustom ? 15 : selectedTemplate?.xp || 15
  const finalXP = Math.round(baseXP * selectedDifficulty.xpMultiplier)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-purple-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-6 rounded-t-3xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">🚀 Choose Your Quest!</h2>
              <p className="text-white/90 text-lg">Pick an epic habit quest to start your hero journey!</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white bg-white/10 rounded-full p-3 text-2xl hover:bg-white/20 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Quest Templates */}
          {!isCustom && (
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                ⭐ Popular Quest Templates
              </h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {questTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-6 rounded-2xl border-4 transition-all duration-200 text-left ${
                      selectedTemplate?.title === template.title
                        ? 'border-purple-500 scale-105 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300 hover:scale-102'
                    }`}
                  >
                    <div className={`bg-gradient-to-br ${template.color} rounded-2xl p-4 mb-4`}>
                      <div className="text-4xl mb-2">{template.icon}</div>
                      <h4 className="font-bold text-white text-lg">{template.title}</h4>
                    </div>
                    <p className="font-medium text-gray-800 mb-2">{template.habit}</p>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                        +{template.xp} XP
                      </span>
                      {selectedTemplate?.title === template.title && (
                        <div className="text-purple-500 text-xl">✓</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center mb-6">
                <button
                  onClick={() => setIsCustom(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transform transition-all duration-200 shadow-lg"
                >
                  🎨 Create Custom Quest
                </button>
              </div>
            </div>
          )}

          {/* Custom Quest */}
          {isCustom && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  🎨 Create Your Own Quest
                </h3>
                <button
                  onClick={() => setIsCustom(false)}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  ← Back to Templates
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
                <label className="block text-lg font-bold text-indigo-800 mb-3">
                  What quest do you want to embark on? 🚀
                </label>
                <input
                  type="text"
                  value={customHabit}
                  onChange={(e) => setCustomHabit(e.target.value)}
                  placeholder="E.g., Practice guitar for 20 minutes, Learn a new language..."
                  className="w-full p-4 text-lg border-2 border-indigo-300 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 font-medium"
                />
              </div>
            </div>
          )}

          {/* Difficulty Selection */}
          {(selectedTemplate || customHabit) && (
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">⚡ Choose Your Difficulty Level</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {difficultyLevels.map((level) => (
                  <button
                    key={level.level}
                    onClick={() => setDifficulty(level.level)}
                    className={`p-4 rounded-2xl border-4 transition-all duration-200 ${
                      difficulty === level.level
                        ? 'border-purple-500 scale-105 shadow-lg'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full ${level.color} flex items-center justify-center text-white font-bold text-xl mx-auto mb-3`}>
                      {level.level === 'easy' ? '1' : level.level === 'medium' ? '2' : '3'}
                    </div>
                    <h4 className="font-bold text-lg mb-2">{level.label}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {level.level === 'easy' && 'Perfect for beginners!'}
                      {level.level === 'medium' && 'Good challenge level!'}
                      {level.level === 'hard' && 'For true heroes only!'}
                    </p>
                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-bold">
                      {Math.round(baseXP * level.xpMultiplier)} XP per day
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quest Summary */}
          {(selectedTemplate || customHabit) && (
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 border-2 border-green-300 mb-6">
              <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center">
                🎯 Quest Summary
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-green-700">Quest:</h4>
                  <p className="text-green-800">{isCustom ? customHabit : selectedTemplate?.habit}</p>
                </div>
                <div>
                  <h4 className="font-bold text-green-700">Daily Reward:</h4>
                  <p className="text-green-800 font-bold">+{finalXP} XP</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-400 transition-colors duration-200"
            >
              Maybe Later
            </button>
            
            <button
              onClick={handleCreateHabit}
              disabled={loading || (!selectedTemplate && !customHabit)}
              className={`font-bold py-3 px-8 rounded-xl transition-all duration-200 ${
                (selectedTemplate || customHabit) && !loading
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? '🚀 Starting Quest...' : '🎉 Accept Quest!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}