import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from '../../utils/toast'

export default function JoinForm({ onSwitchToOTP }) {
  const [formData, setFormData] = useState({ email: '', name: '' })
  const { joinUser, loading, error } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.name) {
      toast.error('Please fill in all fields')
      return
    }

    const result = await joinUser(formData.email, formData.name)
    if (result.success) {
      toast.success('Welcome to Quanta!')
    } else if (result.error === 'User already exists') {
      toast.error('Account exists. Please use OTP to login.')
      onSwitchToOTP(formData.email)
    } else {
      toast.error(result.error || 'Registration failed')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Join Quanta
          </h1>
          <p className="text-gray-600">
            Start your hero journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your name"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            {loading ? 'Creating Account...' : 'Join Quanta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => onSwitchToOTP()}
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            Already have an account? Login with OTP
          </button>
        </div>
      </div>
    </div>
  )
}