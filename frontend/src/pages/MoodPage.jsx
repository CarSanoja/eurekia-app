import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'

// Mood selector component
function MoodSelector({ selectedMood, onMoodSelect }) {
  const moodOptions = [
    { score: 1, emoji: '😢', label: 'Really Sad', color: 'from-red-400 to-red-600' },
    { score: 2, emoji: '😔', label: 'A bit Down', color: 'from-orange-400 to-orange-600' },
    { score: 3, emoji: '😐', label: 'Okay', color: 'from-yellow-400 to-yellow-600' },
    { score: 4, emoji: '😊', label: 'Good', color: 'from-green-400 to-green-600' },
    { score: 5, emoji: '😄', label: 'Amazing!', color: 'from-purple-400 to-purple-600' }
  ]

  return (
    <div className="space-y-3">
      {moodOptions.map((mood) => (
        <button
          key={mood.score}
          onClick={() => onMoodSelect(mood.score)}
          className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 ${
            selectedMood === mood.score
              ? `bg-gradient-to-r ${mood.color} text-white border-white shadow-lg scale-105`
              : 'bg-white text-gray-700 border-purple-200 hover:border-purple-400 hover:scale-102'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{mood.emoji}</span>
              <span className="font-semibold text-lg">{mood.label}</span>
            </div>
            {selectedMood === mood.score && (
              <span className="text-2xl">✨</span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}

// Mood history item
function MoodHistoryItem({ mood }) {
  const moodEmojis = {
    1: '😢',
    2: '😔', 
    3: '😐',
    4: '😊',
    5: '😄'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-md border border-purple-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{moodEmojis[mood.score]}</span>
          <div>
            <div className="font-semibold text-gray-800">
              {formatDate(mood.date)}
            </div>
            {mood.note && (
              <p className="text-gray-600 text-sm mt-1">"{mood.note}"</p>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {mood.score}/5
        </div>
      </div>
    </div>
  )
}

export default function MoodPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedMood, setSelectedMood] = useState(null)
  const [note, setNote] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [todaysMood, setTodaysMood] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  // Check if user already logged mood today
  const { data: moodHistory = [] } = useQuery({
    queryKey: ['mood-history'],
    queryFn: async () => {
      const response = await api.get('/mood/history/')
      return response.data
    }
  })

  useEffect(() => {
    const todayMood = moodHistory.find(mood => mood.date === today)
    if (todayMood) {
      setTodaysMood(todayMood)
      setSelectedMood(todayMood.score)
      setNote(todayMood.note || '')
    }
  }, [moodHistory, today])

  // Save mood mutation
  const saveMoodMutation = useMutation({
    mutationFn: async (moodData) => {
      const response = await api.post('/mood/', moodData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mood-history'])
      queryClient.invalidateQueries(['dashboard'])
      setSelectedMood(null)
      setNote('')
    }
  })

  const handleSave = () => {
    if (selectedMood === null) return

    saveMoodMutation.mutate({
      score: selectedMood,
      note: note.trim(),
      date: today
    })
  }

  const getMoodEmoji = (score) => {
    const emojis = { 1: '😢', 2: '😔', 3: '😐', 4: '😊', 5: '😄' }
    return emojis[score] || '😐'
  }

  const getMoodLabel = (score) => {
    const labels = {
      1: 'Really Sad',
      2: 'A bit Down', 
      3: 'Okay',
      4: 'Good',
      5: 'Amazing!'
    }
    return labels[score] || 'Okay'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Mood Check 😊</h1>
              <p className="text-gray-600">How are you feeling today?</p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="bg-purple-100 text-purple-700 px-4 py-2 rounded-xl font-semibold hover:bg-purple-200 transition-all duration-200"
            >
              {showHistory ? 'Today' : 'History'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {!showHistory ? (
          /* Today's Mood Entry */
          <div className="space-y-6">
            {todaysMood ? (
              /* Already logged today */
              <div className="text-center">
                <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-purple-100">
                  <div className="text-8xl mb-4">{getMoodEmoji(todaysMood.score)}</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Today you felt: {getMoodLabel(todaysMood.score)}
                  </h2>
                  {todaysMood.note && (
                    <div className="bg-purple-50 rounded-xl p-4 mt-4">
                      <p className="text-purple-800 italic">"{todaysMood.note}"</p>
                    </div>
                  )}
                  <p className="text-gray-600 mt-4">
                    Come back tomorrow to log how you're feeling! 🌟
                  </p>
                </div>
              </div>
            ) : (
              /* Mood entry form */
              <>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">💭</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    How are you feeling right now?
                  </h2>
                  <p className="text-gray-600">
                    Take a moment to check in with yourself 🌱
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-purple-100">
                  <MoodSelector
                    selectedMood={selectedMood}
                    onMoodSelect={setSelectedMood}
                  />

                  {selectedMood && (
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Want to share what's on your mind? (Optional) 💭
                        </label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="What made you feel this way? Any thoughts you want to remember?"
                          className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          rows={3}
                        />
                      </div>

                      <button
                        onClick={handleSave}
                        disabled={saveMoodMutation.isPending}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                      >
                        {saveMoodMutation.isPending ? 'Saving...' : 'Save My Mood ✨'}
                      </button>
                    </div>
                  )}
                </div>

                {selectedMood && (
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">
                      Your mood helps track patterns and celebrate progress! 📊
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Mood History */
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📈</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your Mood Journey
              </h2>
              <p className="text-gray-600">
                Look at how you've been feeling! 🌈
              </p>
            </div>

            {moodHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-8xl mb-6">📝</div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Start your mood journey!
                </h3>
                <p className="text-gray-600 mb-6">
                  Log your first mood to see your emotional patterns over time.
                </p>
                <button
                  onClick={() => setShowHistory(false)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Log My Mood 😊
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {moodHistory
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((mood, index) => (
                    <MoodHistoryItem key={mood.date || index} mood={mood} />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}