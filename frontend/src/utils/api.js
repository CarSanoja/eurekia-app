const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api'

// Function to handle 401 errors and token refresh
const handleAuthError = async (originalRequest) => {
  try {
    const { authService } = await import('../services/auth')
    const refreshResult = await authService.refreshToken()
    
    if (refreshResult.success) {
      // Retry the original request with new token
      const token = localStorage.getItem('eurekia_token')
      originalRequest.headers['Authorization'] = token ? `Bearer ${token}` : ''
      
      const retryResponse = await fetch(originalRequest.url, originalRequest)
      return retryResponse
    } else {
      // Refresh failed, redirect to login or use demo mode
      console.warn('Token refresh failed, authentication may be expired')
      return null
    }
  } catch (error) {
    console.error('Error handling auth error:', error)
    return null
  }
}

// Create axios-like API client
const api = {
  get: async (endpoint) => {
    const token = localStorage.getItem('eurekia_token')
    const requestConfig = {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      url: `${API_BASE_URL}${endpoint}`
    }
    
    const response = await fetch(requestConfig.url, requestConfig)
    
    // Handle 401 - token expired
    if (response.status === 401 && token && !token.startsWith('demo_token_')) {
      const retryResponse = await handleAuthError(requestConfig)
      if (retryResponse && retryResponse.ok) {
        return { data: await retryResponse.json() }
      }
    }
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.response = { status: response.status }
      throw error
    }
    
    return { data: await response.json() }
  },

  post: async (endpoint, data) => {
    const token = localStorage.getItem('eurekia_token')
    const requestConfig = {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      url: `${API_BASE_URL}${endpoint}`
    }
    
    const response = await fetch(requestConfig.url, requestConfig)
    
    // Handle 401 - token expired
    if (response.status === 401 && token && !token.startsWith('demo_token_')) {
      const retryResponse = await handleAuthError(requestConfig)
      if (retryResponse && retryResponse.ok) {
        return { data: await retryResponse.json() }
      }
    }
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.response = { status: response.status }
      throw error
    }
    
    return { data: await response.json() }
  },

  put: async (endpoint, data) => {
    const token = localStorage.getItem('eurekia_token')
    const requestConfig = {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      url: `${API_BASE_URL}${endpoint}`
    }
    
    const response = await fetch(requestConfig.url, requestConfig)
    
    // Handle 401 - token expired
    if (response.status === 401 && token && !token.startsWith('demo_token_')) {
      const retryResponse = await handleAuthError(requestConfig)
      if (retryResponse && retryResponse.ok) {
        return { data: await retryResponse.json() }
      }
    }
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.response = { status: response.status }
      throw error
    }
    
    return { data: await response.json() }
  },

  delete: async (endpoint) => {
    const token = localStorage.getItem('eurekia_token')
    const requestConfig = {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      url: `${API_BASE_URL}${endpoint}`
    }
    
    const response = await fetch(requestConfig.url, requestConfig)
    
    // Handle 401 - token expired
    if (response.status === 401 && token && !token.startsWith('demo_token_')) {
      const retryResponse = await handleAuthError(requestConfig)
      if (retryResponse && retryResponse.ok) {
        return { data: retryResponse.status === 204 ? null : await retryResponse.json() }
      }
    }
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.response = { status: response.status }
      throw error
    }
    
    return { data: response.status === 204 ? null : await response.json() }
  }
}

export default api