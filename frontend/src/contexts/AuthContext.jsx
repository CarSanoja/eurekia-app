import { createContext, useContext, useReducer, useEffect } from 'react'

const AuthContext = createContext()

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
    default:
      return state
  }
}

const initialState = {
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: false,
  loading: false,
  error: null,
  otpSent: false
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    if (state.token) {
      fetchUserProfile()
    }
  }, [state.token])

  const fetchUserProfile = async () => {
    try {
      dispatch({ type: 'LOGIN_START' })
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me/`, {
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const user = await response.json()
        dispatch({ type: 'LOGIN_SUCCESS', payload: user })
      } else {
        localStorage.removeItem('authToken')
        dispatch({ type: 'LOGOUT' })
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
      localStorage.removeItem('authToken')
      dispatch({ type: 'LOGOUT' })
    }
  }

  const joinUser = async (email, name) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/join/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('authToken', data.token)
        dispatch({ type: 'SET_TOKEN', payload: data.token })
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.user })
        return { success: true }
      } else {
        dispatch({ type: 'LOGIN_ERROR', payload: data.detail || 'Registration failed' })
        return { success: false, error: data.detail }
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const requestOTP = async (email) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (response.ok) {
        dispatch({ type: 'OTP_SENT' })
        return { success: true }
      } else {
        const data = await response.json()
        dispatch({ type: 'LOGIN_ERROR', payload: data.detail || 'Failed to send OTP' })
        return { success: false, error: data.detail }
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const verifyOTP = async (email, code) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        localStorage.setItem('authToken', data.token)
        dispatch({ type: 'SET_TOKEN', payload: data.token })
        dispatch({ type: 'LOGIN_SUCCESS', payload: data.user })
        return { success: true }
      } else {
        dispatch({ type: 'LOGIN_ERROR', payload: data.detail || 'OTP verification failed' })
        return { success: false, error: data.detail }
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message })
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    dispatch({ type: 'LOGOUT' })
  }

  const value = {
    ...state,
    joinUser,
    requestOTP,
    verifyOTP,
    logout
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