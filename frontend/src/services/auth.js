import api from '../utils/api'

export const authService = {
  /**
   * Auto-login with admin credentials
   * This happens transparently without user interaction
   */
  async autoLogin() {
    try {
      const response = await api.post('/auth/login/', {
        email: 'admin@eurekia.com',
        password: 'admin123'
      })
      
      const { access, refresh, user } = response.data
      
      // Store tokens and user data
      localStorage.setItem('eurekia_token', access)
      localStorage.setItem('eurekia_refresh', refresh)
      localStorage.setItem('eurekia_user', JSON.stringify(user))
      
      return { success: true, user, token: access }
    } catch (error) {
      console.error('Auto-login failed:', error)
      return { success: false, error }
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem('eurekia_token')
    const user = localStorage.getItem('eurekia_user')
    return !!(token && user)
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('eurekia_user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  },

  /**
   * Clear authentication data
   */
  logout() {
    localStorage.removeItem('eurekia_token')
    localStorage.removeItem('eurekia_refresh')
    localStorage.removeItem('eurekia_user')
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('eurekia_refresh')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      localStorage.setItem('eurekia_token', data.access)
      
      return { success: true, token: data.access }
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Clear invalid tokens and trigger re-authentication
      this.logout()
      return { success: false, error }
    }
  },

  /**
   * Initialize authentication
   * This is called when the app starts
   */
  async init() {
    if (this.isAuthenticated()) {
      return { success: true, user: this.getCurrentUser() }
    }
    
    // If not authenticated, try auto-login
    return await this.autoLogin()
  }
}

export default authService