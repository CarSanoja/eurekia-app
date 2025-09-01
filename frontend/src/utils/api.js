const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api'

// Create axios-like API client
const api = {
  get: async (endpoint) => {
    const token = localStorage.getItem('eurekia_token')
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.response = { status: response.status }
      throw error
    }
    
    return { data: await response.json() }
  },

  post: async (endpoint, data) => {
    const token = localStorage.getItem('eurekia_token')
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.response = { status: response.status }
      throw error
    }
    
    return { data: await response.json() }
  },

  put: async (endpoint, data) => {
    const token = localStorage.getItem('eurekia_token')
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.response = { status: response.status }
      throw error
    }
    
    return { data: await response.json() }
  },

  delete: async (endpoint) => {
    const token = localStorage.getItem('eurekia_token')
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`)
      error.response = { status: response.status }
      throw error
    }
    
    return { data: response.status === 204 ? null : await response.json() }
  }
}

export default api