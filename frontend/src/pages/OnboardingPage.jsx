import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import WelcomeScreen from '../components/onboarding/WelcomeScreen'
import AvatarSelector from '../components/onboarding/AvatarSelector'
import MissionSetup from '../components/onboarding/MissionSetup'
import toast from 'react-hot-toast'

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
      // Update user profile with avatar
      if (selectedAvatar) {
        const profileResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/me/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            avatar_icon: selectedAvatar.icon,
            avatar_color: selectedAvatar.color
          })
        })
        
        if (!profileResponse.ok) {
          throw new Error('Failed to update profile')
        }
      }

      // Save mission
      if (mission.skill || mission.weakness) {
        const missionResponse = await fetch(`${import.meta.env.VITE_API_URL}/mission/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mission)
        })
        
        if (!missionResponse.ok) {
          throw new Error('Failed to save mission')
        }
      }

      toast.success('🎉 Welcome to your hero journey!')
      onComplete()
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Something went wrong. Let\'s try that again!')
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