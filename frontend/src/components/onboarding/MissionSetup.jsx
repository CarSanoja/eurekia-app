import { useState } from 'react'

const missionPrompts = [
  {
    title: "What's your superpower? 💪",
    placeholder: "I'm amazing at helping others, playing sports, being creative...",
    icon: "⭐"
  },
  {
    title: "What challenge do you want to level up? 🎯",
    placeholder: "I want to get better at staying organized, being more confident...",
    icon: "🚀"
  }
]

const missionSuggestions = [
  "I'm a creative person who loves art and music",
  "I'm a helpful friend who cares about others", 
  "I'm an athlete who loves staying active",
  "I'm a student who loves learning new things",
  "I'm a leader who inspires others",
  "I'm a problem-solver who finds solutions"
]

export default function MissionSetup({ mission, onMissionChange, onNext, onBack }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [skills, setSkills] = useState('')
  const [challenges, setChallenges] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSuggestionClick = (suggestion) => {
    if (currentStep === 0) {
      setSkills(suggestion)
      onMissionChange({ skill: suggestion, weakness: challenges })
    }
    setShowSuggestions(false)
  }

  const handleNext = () => {
    if (currentStep === 0 && skills) {
      setCurrentStep(1)
      onMissionChange({ skill: skills, weakness: challenges })
    } else if (currentStep === 1 && challenges) {
      onMissionChange({ skill: skills, weakness: challenges })
      onNext()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      onBack()
    }
  }

  const currentPrompt = missionPrompts[currentStep]
  const currentValue = currentStep === 0 ? skills : challenges
  const handleChange = (value) => {
    if (currentStep === 0) {
      setSkills(value)
      onMissionChange({ skill: value, weakness: challenges })
    } else {
      setChallenges(value)
      onMissionChange({ skill: skills, weakness: value })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-3xl w-full shadow-2xl border-2 border-white/20">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">{currentPrompt.icon}</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Create Your Hero Mission!
          </h1>
          <div className="flex justify-center mb-6">
            {missionPrompts.map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full mx-2 transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-purple-500 scale-125' 
                    : index < currentStep 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">
              {currentPrompt.title}
            </h2>
            <p className="text-purple-600 text-lg">
              Step {currentStep + 1} of {missionPrompts.length}
            </p>
          </div>

          <div className="relative">
            <textarea
              value={currentValue}
              onChange={(e) => handleChange(e.target.value)}
              onFocus={() => currentStep === 0 && setShowSuggestions(true)}
              placeholder={currentPrompt.placeholder}
              rows={4}
              className="w-full p-6 text-lg border-3 border-purple-300 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 resize-none bg-white shadow-inner font-medium"
            />
            
            {showSuggestions && currentStep === 0 && (
              <div className="absolute z-10 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border-2 border-purple-200 p-4">
                <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                  💡 Need inspiration? Try these:
                </h4>
                <div className="grid gap-2">
                  {missionSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-left p-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 transition-colors duration-200 border border-purple-200 hover:border-purple-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {currentValue && (
          <div className="text-center mb-8 p-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl border-2 border-green-200">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Great work, hero! 
            </h3>
            <p className="text-green-600">
              {currentStep === 0 ? "Your superpower is amazing!" : "You're ready to level up!"}
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            className="bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-400 transition-colors duration-200"
          >
            ← Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={!currentValue}
            className={`font-bold py-3 px-6 rounded-xl transition-all duration-200 ${
              currentValue
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentStep === missionPrompts.length - 1 ? 'Start My Journey! 🚀' : 'Next Question →'}
          </button>
        </div>
      </div>
    </div>
  )
}