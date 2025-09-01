import { useState, useEffect } from 'react'

const welcomeMessages = [
  "Welcome to your epic adventure! 🚀",
  "Get ready to become a habit hero! 💪", 
  "Time to level up your life! ⭐",
  "Your journey to awesome starts now! 🌟"
]

const floatingEmojis = ['🌟', '⚡', '🚀', '💎', '🎯', '🔥', '🌈', '🦄']

export default function WelcomeScreen({ user, onStart }) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % welcomeMessages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Background Emojis */}
      {floatingEmojis.map((emoji, index) => (
        <div
          key={index}
          className={`absolute text-6xl opacity-20 animate-pulse`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${index * 0.5}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          {emoji}
        </div>
      ))}

      <div className={`bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-2xl w-full shadow-2xl border-2 border-white/30 text-center transition-all duration-1000 ${
        showContent ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
      }`}>
        
        {/* Animated Welcome Icon */}
        <div className="text-8xl mb-6 animate-bounce">
          🎉
        </div>

        {/* Dynamic Welcome Message */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4 transition-all duration-500">
            {welcomeMessages[currentMessage]}
          </h1>
          <p className="text-xl text-gray-600 font-medium">
            Hi <span className="font-bold text-purple-600">{user?.name}</span>! 
            Let's set up your personal quest to build amazing habits! ✨
          </p>
        </div>

        {/* Feature Preview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-2xl border-2 border-green-300">
            <div className="text-4xl mb-3">💪</div>
            <h3 className="font-bold text-green-800 mb-2">Build Habits</h3>
            <p className="text-sm text-green-600">Track daily quests and build epic streaks!</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl border-2 border-blue-300">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="font-bold text-blue-800 mb-2">Earn Rewards</h3>
            <p className="text-sm text-blue-600">Level up and unlock cool achievements!</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-2xl border-2 border-purple-300">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-bold text-purple-800 mb-2">Track Progress</h3>
            <p className="text-sm text-purple-600">See your awesome growth over time!</p>
          </div>
        </div>

        {/* Fun Stats */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-2xl border-2 border-yellow-300 mb-8">
          <h4 className="font-bold text-orange-800 mb-3 flex items-center justify-center">
            🔥 Join thousands of young heroes!
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-700">10K+</div>
              <div className="text-sm text-orange-600">Heroes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-700">50K+</div>
              <div className="text-sm text-orange-600">Habits Built</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-700">1M+</div>
              <div className="text-sm text-orange-600">XP Earned</div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white font-bold py-4 px-8 rounded-2xl text-xl hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-2xl animate-pulse"
        >
          🚀 Let's Start Your Adventure!
        </button>

        {/* Fine print */}
        <p className="text-xs text-gray-500 mt-4">
          This will take about 2 minutes and will be super fun! 🎮
        </p>
      </div>
    </div>
  )
}