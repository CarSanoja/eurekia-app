import { useState } from 'react'

const avatarOptions = [
  { icon: '🌟', color: '#FFD700', name: 'Golden Star' },
  { icon: '🚀', color: '#FF6B6B', name: 'Space Rocket' },
  { icon: '🦄', color: '#FF69B4', name: 'Magic Unicorn' },
  { icon: '🎯', color: '#4ECDC4', name: 'Target Master' },
  { icon: '⚡', color: '#FFE066', name: 'Lightning Bolt' },
  { icon: '🔥', color: '#FF4757', name: 'Fire Power' },
  { icon: '🌈', color: '#A8E6CF', name: 'Rainbow Spirit' },
  { icon: '💎', color: '#74B9FF', name: 'Diamond Hero' },
  { icon: '🎮', color: '#6C5CE7', name: 'Game Master' },
  { icon: '🏆', color: '#FDCB6E', name: 'Champion' },
  { icon: '🦸', color: '#E17055', name: 'Super Hero' },
  { icon: '🌸', color: '#FD79A8', name: 'Cherry Blossom' },
]

export default function AvatarSelector({ selectedAvatar, onAvatarSelect, onNext, onBack }) {
  const [hoveredAvatar, setHoveredAvatar] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-4xl w-full shadow-2xl border-2 border-white/20">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-bounce">🎨</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Choose Your Hero Avatar!
          </h1>
          <p className="text-xl text-gray-600">
            Pick the avatar that represents the awesome hero you want to become! ✨
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {avatarOptions.map((avatar, index) => (
            <button
              key={index}
              onClick={() => onAvatarSelect(avatar)}
              onMouseEnter={() => setHoveredAvatar(index)}
              onMouseLeave={() => setHoveredAvatar(null)}
              className={`relative p-4 rounded-2xl border-4 transition-all duration-200 ${
                selectedAvatar?.icon === avatar.icon
                  ? 'border-purple-500 bg-purple-100 scale-110 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:scale-105'
              } ${hoveredAvatar === index ? 'animate-pulse' : ''}`}
              style={{ 
                backgroundColor: selectedAvatar?.icon === avatar.icon ? `${avatar.color}20` : 'white'
              }}
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-2 shadow-lg border-2 border-white"
                style={{ backgroundColor: avatar.color }}
              >
                {avatar.icon}
              </div>
              <div className="text-xs font-medium text-gray-700 text-center">
                {avatar.name}
              </div>
              
              {selectedAvatar?.icon === avatar.icon && (
                <div className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
              )}
            </button>
          ))}
        </div>

        {selectedAvatar && (
          <div className="text-center mb-8 p-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border-2 border-purple-200">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="text-xl font-bold text-purple-800 mb-2">
              Awesome choice! You selected: {selectedAvatar.name}
            </h3>
            <p className="text-purple-600">
              This avatar will represent you on your epic habit-building journey!
            </p>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-400 transition-colors duration-200"
          >
            ← Back
          </button>
          
          <button
            onClick={onNext}
            disabled={!selectedAvatar}
            className={`font-bold py-3 px-6 rounded-xl transition-all duration-200 ${
              selectedAvatar
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next: Set Your Mission! →
          </button>
        </div>
      </div>
    </div>
  )
}