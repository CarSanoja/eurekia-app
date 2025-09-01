import { useState } from 'react'
import JoinForm from '../components/auth/JoinForm'
import OTPForm from '../components/auth/OTPForm'

export default function AuthPage() {
  const [view, setView] = useState('join') // 'join' or 'otp'
  const [prefilledEmail, setPrefilledEmail] = useState('')

  const handleSwitchToOTP = (email = '') => {
    setPrefilledEmail(email)
    setView('otp')
  }

  const handleBackToJoin = () => {
    setView('join')
    setPrefilledEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {view === 'join' ? (
          <JoinForm onSwitchToOTP={handleSwitchToOTP} />
        ) : (
          <OTPForm 
            initialEmail={prefilledEmail} 
            onBack={handleBackToJoin} 
          />
        )}
      </div>
    </div>
  )
}