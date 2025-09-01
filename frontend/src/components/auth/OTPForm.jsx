import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function OTPForm({ initialEmail, onBack }) {
  const [email, setEmail] = useState(initialEmail || '')
  const [otp, setOTP] = useState('')
  const [step, setStep] = useState(initialEmail ? 'otp' : 'email')
  const { requestOTP, verifyOTP, loading, error, otpSent } = useAuth()

  useEffect(() => {
    if (otpSent) {
      setStep('otp')
    }
  }, [otpSent])

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    const result = await requestOTP(email)
    if (result.success) {
      toast.success('OTP sent to your email!')
    } else {
      toast.error(result.error || 'Failed to send OTP')
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp) {
      toast.error('Please enter the OTP')
      return
    }

    const result = await verifyOTP(email, otp)
    if (result.success) {
      toast.success('Welcome back!')
    } else {
      toast.error(result.error || 'Invalid OTP')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 'email' ? 'Login to Quanta' : 'Enter OTP'}
          </h1>
          <p className="text-gray-600">
            {step === 'email' 
              ? 'Enter your email to receive a login code'
              : `We sent a code to ${email}`
            }
          </p>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Login Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Login Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOTP(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-lg tracking-widest"
                placeholder="000000"
                maxLength={6}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => handleRequestOTP({ preventDefault: () => {} })}
                className="text-primary-600 hover:text-primary-700 text-sm"
                disabled={loading}
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-700 text-sm"
          >
            ← Back to join
          </button>
        </div>
      </div>
    </div>
  )
}