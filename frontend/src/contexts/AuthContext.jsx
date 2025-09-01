import { createContext, useContext, useReducer, useEffect } from 'react'
import { initializeAnalytics } from '../utils/analytics'

const AuthContext = createContext()

// Hardcoded demo user
const DEMO_USER = {
  id: 1,
  email: 'demo@eurekia.com',
  name: 'Demo Hero',
  avatar_icon: '🦸',
  avatar_color: 'bg-gradient-to-r from-purple-500 to-pink-500',
  is_active: true,
  created_at: new Date().toISOString(),
  onboarding_completed: true,
  habits_count: 3,
  current_streak: 7,
  total_checkins: 42,
  badges_earned: 5
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false }
    case 'LOGIN_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, token: null }
    case 'SET_TOKEN':
      return { ...state, token: action.payload }
    case 'OTP_SENT':
      return { ...state, otpSent: true, loading: false }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
    default:
      return state
  }
}

const initialState = {
  user: null,
  token: localStorage.getItem('eurekia_token'),
  isAuthenticated: false,
  loading: false,
  error: null,
  otpSent: false
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    // Check if user has a token stored
    if (state.token) {
      // Simulate fetching user profile with hardcoded data
      setTimeout(() => {
        dispatch({ type: 'LOGIN_SUCCESS', payload: DEMO_USER })
        initializeAnalytics(DEMO_USER)
      }, 500)
    }
  }, [state.token])

  // Simplified login - accepts any email/password
  const joinUser = async (email, name) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Always succeed with demo user
      const user = {
        ...DEMO_USER,
        email: email || DEMO_USER.email,
        name: name || DEMO_USER.name,
        avatar_icon: '',  // Will be set during onboarding
        onboarding_completed: false
      }
      
      const token = 'demo_token_' + Date.now()
      
      localStorage.setItem('eurekia_token', token)
      dispatch({ type: 'SET_TOKEN', payload: token })
      dispatch({ type: 'LOGIN_SUCCESS', payload: user })
      initializeAnalytics(user)
      
      return { success: true }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  // Simplified OTP request - always succeeds
  const requestOTP = async (email) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      dispatch({ type: 'OTP_SENT' })
      console.log('Demo Mode: OTP would be sent to', email)
      console.log('Demo Mode: Use any 6-digit code to login')
      
      return { success: true }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  // Simplified OTP verification - accepts any 6-digit code
  const verifyOTP = async (email, code) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Accept any 6-digit code
      if (code && code.length === 6) {
        const user = {
          ...DEMO_USER,
          email: email || DEMO_USER.email
        }
        
        const token = 'demo_token_' + Date.now()
        
        localStorage.setItem('eurekia_token', token)
        dispatch({ type: 'SET_TOKEN', payload: token })
        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
        initializeAnalytics(user)
        
        return { success: true }
      } else {
        dispatch({ type: 'LOGIN_ERROR', payload: 'Please enter a 6-digit code' })
        return { success: false, error: 'Please enter a 6-digit code' }
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  // Update user profile (for onboarding)
  const updateUser = (updates) => {
    const updatedUser = { ...state.user, ...updates }
    dispatch({ type: 'UPDATE_USER', payload: updates })
    
    // If onboarding is completed, mark it
    if (updates.avatar_icon && updates.mission) {
      dispatch({ type: 'UPDATE_USER', payload: { onboarding_completed: true } })
    }
    
    return updatedUser
  }

  const logout = () => {
    localStorage.removeItem('eurekia_token')
    dispatch({ type: 'LOGOUT' })
    console.log('Logged out successfully')
  }

  const value = {
    ...state,
    joinUser,
    requestOTP,
    verifyOTP,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}