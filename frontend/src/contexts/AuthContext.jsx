import { createContext, useContext, useReducer, useEffect } from 'react'
import { initializeAnalytics } from '../utils/analytics'
import authService from '../services/auth'

const AuthContext = createContext()

// Hardcoded demo user (configured as admin)
const DEMO_USER = {
  id: 1,
  email: 'admin@eurekia.com',
  name: 'Admin User',
  avatar_icon: '🔧',
  avatar_color: '#0ea5e9',
  is_active: true,
  is_staff: true,
  is_superuser: true,
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
    const initializeAuth = async () => {
      try {
        dispatch({ type: 'LOGIN_START' })
        
        // Try to initialize authentication (checks existing token or auto-login)
        const result = await authService.init()
        
        if (result.success) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: result.user })
          dispatch({ type: 'SET_TOKEN', payload: localStorage.getItem('eurekia_token') })
          initializeAnalytics(result.user)
        } else {
          // Fallback to demo user if API fails
          console.warn('API auth failed, using demo mode:', result.error)
          const token = 'demo_token_' + Date.now()
          localStorage.setItem('eurekia_token', token)
          dispatch({ type: 'SET_TOKEN', payload: token })
          dispatch({ type: 'LOGIN_SUCCESS', payload: DEMO_USER })
          initializeAnalytics(DEMO_USER)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Fallback to demo mode
        const token = 'demo_token_' + Date.now()
        localStorage.setItem('eurekia_token', token)
        dispatch({ type: 'SET_TOKEN', payload: token })
        dispatch({ type: 'LOGIN_SUCCESS', payload: DEMO_USER })
        initializeAnalytics(DEMO_USER)
      }
    }

    if (!state.isAuthenticated) {
      initializeAuth()
    }
  }, [])

  // Try real API login, fallback to demo mode
  const joinUser = async (email, name) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      // Try API authentication first
      const result = await authService.autoLogin()
      
      if (result.success) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: result.user })
        dispatch({ type: 'SET_TOKEN', payload: result.token })
        initializeAnalytics(result.user)
        return { success: true }
      } else {
        // Fallback to demo mode
        console.warn('API login failed, using demo mode')
        const isAdmin = email === 'admin@eurekia.com'
        const user = {
          ...DEMO_USER,
          email: email || DEMO_USER.email,
          name: name || DEMO_USER.name,
          avatar_icon: isAdmin ? '🔧' : '',
          onboarding_completed: isAdmin ? true : false,
          is_staff: isAdmin ? true : false,
          is_superuser: isAdmin ? true : false
        }
        
        const token = 'demo_token_' + Date.now()
        localStorage.setItem('eurekia_token', token)
        dispatch({ type: 'SET_TOKEN', payload: token })
        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
        initializeAnalytics(user)
        
        return { success: true }
      }
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
        const isAdmin = email === 'admin@eurekia.com'
        const user = {
          ...DEMO_USER,
          email: email || DEMO_USER.email,
          avatar_icon: isAdmin ? '🔧' : '🦸',
          onboarding_completed: isAdmin ? true : true, // Both demo users complete onboarding
          is_staff: isAdmin ? true : false,
          is_superuser: isAdmin ? true : false
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