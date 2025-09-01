import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import WelcomeScreen from '../components/onboarding/WelcomeScreen'
import AvatarSelector from '../components/onboarding/AvatarSelector'
import MissionSetup from '../components/onboarding/MissionSetup'
import { toast } from '../utils/toast'

export default function OnboardingPage({ onComplete }) {
  const { user, token } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [mission, setMission] = useState({ skill: '', weakness: '' })
  const [loading, setLoading] = useState(false)

  const steps = ['welcome', 'avatar', 'mission']

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Get token from localStorage as fallback
      const authToken = token || localStorage.getItem('eurekia_token')
      
      console.log('Token from context:', token ? 'Present' : 'Missing')
      console.log('Token from localStorage:', localStorage.getItem('eurekia_token') ? 'Present' : 'Missing')
      console.log('Using token:', authToken ? 'Yes' : 'No')
      
      if (!authToken) {
        throw new Error('No authentication token available')
      }

      // Update user profile with avatar
      if (selectedAvatar) {
        // First get current user data
        const currentUserResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/me/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!currentUserResponse.ok) {
          throw new Error(`Failed to get user profile: ${currentUserResponse.status}`)
        }
        
        const currentUser = await currentUserResponse.json()
        console.log('Current user data:', currentUser)
        
        // Update with avatar keeping existing data
        const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/me/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...currentUser,
            avatar_icon: selectedAvatar.icon,
            avatar_color: selectedAvatar.color
          })
        })
        
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json().catch(() => ({}))
          console.error('Profile update failed:', profileResponse.status, errorData)
          throw new Error(`Failed to update profile: ${profileResponse.status} - ${errorData.detail || 'Unknown error'}`)
        }
      }

      // Save mission
      if (mission.skill || mission.weakness) {
        const missionResponse = await fetch(`${import.meta.env.VITE_API_URL}/mission/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mission)
        })
        
        if (!missionResponse.ok) {
          const errorData = await missionResponse.json().catch(() => ({}))
          console.error('Mission save failed:', missionResponse.status, errorData)
          throw new Error(`Failed to save mission: ${missionResponse.status} - ${errorData.detail || 'Unknown error'}`)
        }
      }

      toast.success('🎉 Welcome to your hero journey!')
      onComplete()
    } catch (error) {
      console.error('Onboarding error:', error)
      if (error.message.includes('401')) {
        toast.error('Authentication expired. Please refresh and try again!')
      } else if (error.message.includes('No authentication token')) {
        toast.error('Please log in again to continue!')
      } else {
        toast.error(`Error: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="bg-white/95 rounded-3xl p-8 text-center shadow-2xl">
          <div className="text-6xl mb-4 animate-spin">⚡</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Setting up your adventure...
          </h2>
          <p className="text-gray-600">
            Just a moment while we prepare everything for you! 🚀
          </p>
        </div>
      </div>
    )
  }

  if (currentStep === 0) {
    return <WelcomeScreen user={user} onStart={handleNext} />
  }

  if (currentStep === 1) {
    return (
      <AvatarSelector
        selectedAvatar={selectedAvatar}
        onAvatarSelect={setSelectedAvatar}
        onNext={handleNext}
        onBack={handleBack}
      />
    )
  }

  if (currentStep === 2) {
    return (
      <MissionSetup
        mission={mission}
        onMissionChange={setMission}
        onNext={handleNext}
        onBack={handleBack}
      />
    )
  }

  return null
}