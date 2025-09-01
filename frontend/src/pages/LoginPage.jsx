import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = useState('demo@eurekia.com')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // 'email' or 'otp'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { requestOTP, verifyOTP, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const result = await requestOTP(email)
    
    if (result.success) {
      setStep('otp')
    } else {
      setError(result.error || 'Failed to send OTP')
    }
    
    setLoading(false)
  }

  const handleOTPSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const result = await verifyOTP(email, code)
    
    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Invalid OTP')
    }
    
    setLoading(false)
  }

  if (isAuthenticated) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to Eurekia! 🚀
          </h1>
          <p className="text-gray-600">Your Hero Journey Begins Here</p>
        </div>

        {/* Demo Mode Notice */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚡</span>
            <h3 className="font-bold text-yellow-800">Demo Mode Active</h3>
          </div>
          <p className="text-sm text-yellow-700">
            {step === 'email' 
              ? 'Enter any email to continue, or use the default demo@eurekia.com'
              : 'Enter any 6-digit code (e.g., 123456) to login'}
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hero@example.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Sending Magic Link...
                </span>
              ) : (
                'Get Magic Link 🪄'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTPSubmit}>
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
              >
                ← Change email
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition-colors text-center text-2xl font-mono tracking-widest"
                maxLength="6"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Check your email for the magic code we sent to {email}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚡</span>
                  Verifying...
                </span>
              ) : (
                'Start Your Journey 🦸'
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}