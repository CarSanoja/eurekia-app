// Real API service for backend integration
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api'
  }

  getToken() {
    return localStorage.getItem('eurekia_token')
  }

  async request(endpoint, options = {}) {
    const token = this.getToken()
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      throw error
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const url = queryString ? `${endpoint}?${queryString}` : endpoint
    return this.request(url)
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    })
  }

  // Badge related APIs
  async getBadges() {
    return this.get('/badges/')
  }

  async getBadgeStats() {
    return this.get('/badges/stats/')
  }

  // Progress tracking APIs
  async getProgressStats() {
    return this.get('/progress/stats/')
  }

  async getProgressChart(days = 30) {
    return this.get('/progress/chart/', { days })
  }

  async getProgressCalendar(year, month) {
    return this.get('/progress/calendar/', { year, month })
  }

  // Habit APIs
  async getHabits() {
    return this.get('/habits/')
  }

  async createHabit(habitData) {
    return this.post('/habits/', habitData)
  }

  async updateHabit(habitId, habitData) {
    return this.put(`/habits/${habitId}/`, habitData)
  }

  async deleteHabit(habitId) {
    return this.delete(`/habits/${habitId}/`)
  }

  async createHabitCheckin(habitId, checkinData) {
    return this.post(`/habits/${habitId}/checkins/`, checkinData)
  }

  async getHabitStreakStats(habitId) {
    return this.get(`/habits/${habitId}/streak-stats/`)
  }

  // User profile APIs
  async getUserProfile() {
    return this.get('/users/me/')
  }

  async updateUserProfile(userData) {
    return this.put('/users/me/', userData)
  }

  // Mission and Vision APIs
  async getMission() {
    return this.get('/mission/')
  }

  async updateMission(missionData) {
    return this.put('/mission/', missionData)
  }

  async getVision() {
    return this.get('/vision/')
  }

  async updateVision(visionData) {
    return this.put('/vision/', visionData)
  }

  // Mood tracking APIs
  async createMoodEntry(moodData) {
    return this.post('/mood/', moodData)
  }

  async getMoodHistory(days = 30) {
    return this.get('/mood/history/', { days })
  }
}

// Export singleton instance
export default new ApiService()