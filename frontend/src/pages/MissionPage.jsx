import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'

export default function MissionPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const [skill, setSkill] = useState('')
  const [weakness, setWeakness] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Fetch current mission
  const { data: mission, isLoading } = useQuery({
    queryKey: ['mission'],
    queryFn: async () => {
      try {
        const response = await api.get('/mission/')
        return response.data
      } catch (error) {
        if (error.response?.status === 404) {
          return null // No mission set yet
        }
        throw error
      }
    }
  })

  // Update form when mission data loads
  useEffect(() => {
    if (mission) {
      setSkill(mission.skill || '')
      setWeakness(mission.weakness || '')
    }
  }, [mission])

  // Save/update mission
  const saveMissionMutation = useMutation({
    mutationFn: async (missionData) => {
      if (mission) {
        const response = await api.put('/mission/', missionData)
        return response.data
      } else {
        const response = await api.post('/mission/', missionData)
        return response.data
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mission'])
      queryClient.invalidateQueries(['profile'])
      setIsEditing(false)
    }
  })

  const handleSave = () => {
    if (!skill.trim() || !weakness.trim()) return

    saveMissionMutation.mutate({
      skill: skill.trim(),
      weakness: weakness.trim()
    })
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (mission) {
      setSkill(mission.skill || '')
      setWeakness(mission.weakness || '')
    } else {
      setSkill('')
      setWeakness('')
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">⚡</div>
          <h2 className="text-xl font-bold text-gray-800">Loading your mission...</h2>
        </div>
      </div>
    )
  }

  const hasMission = mission && mission.skill && mission.weakness
  const showForm = !hasMission || isEditing

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Mission ⚡</h1>
            <p className="text-gray-600">
              {hasMission ? 'Your hero identity contract' : 'Define your hero journey'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {showForm ? (
          /* Edit Form */
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🦸‍♂️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {hasMission ? 'Update Your Mission' : 'Create Your Hero Identity'}
              </h2>
              <p className="text-gray-600">
                Every hero has a mission. Define yours to guide your journey! 🌟
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-purple-100">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-3">
                    💪 What skill or strength do you want to develop?
                  </label>
                  <textarea
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    placeholder="e.g., I want to become more confident, learn to play guitar, become healthier..."
                    className="w-full p-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-800"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Think about what superpower you want to develop! ⚡
                  </p>
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-800 mb-3">
                    🎯 What weakness or challenge do you want to overcome?
                  </label>
                  <textarea
                    value={weakness}
                    onChange={(e) => setWeakness(e.target.value)}
                    placeholder="e.g., I want to stop procrastinating, overcome my fear of speaking up, beat my negative thoughts..."
                    className="w-full p-4 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-800"
                    rows={3}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Every hero faces challenges. What's yours? 🛡️
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                {hasMission && (
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition-all duration-200"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={saveMissionMutation.isPending || !skill.trim() || !weakness.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                >
                  {saveMissionMutation.isPending ? (
                    'Saving...'
                  ) : hasMission ? (
                    'Update Mission 🚀'
                  ) : (
                    'Accept Mission 🚀'
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Display Mission */
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="text-8xl mb-4">🦸‍♂️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Mission Accepted! ⚡
              </h2>
              <p className="text-gray-600">
                Your hero identity is locked and loaded! 🎯
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-purple-100">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
                  <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center">
                    💪 Developing Strength
                  </h3>
                  <p className="text-green-700 text-base leading-relaxed">
                    {mission.skill}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
                    🎯 Overcoming Challenge
                  </h3>
                  <p className="text-blue-700 text-base leading-relaxed">
                    {mission.weakness}
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                <p className="text-purple-800 text-center font-semibold">
                  🌟 Every habit you build should support this mission! 🌟
                </p>
              </div>

              <button
                onClick={handleEdit}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Update Mission ✏️
              </button>
            </div>

            {/* Mission Stats */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-purple-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
                Mission Progress 📊
              </h3>
              <div className="text-center">
                <p className="text-gray-600">
                  Mission created {new Date(mission.created_at).toLocaleDateString()}
                </p>
                <div className="mt-4 flex justify-center">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-semibold">
                    Hero Level: Active 🔥
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}