import toast from 'react-hot-toast'

// Demo badge data - in real app this would come from API
const DEMO_BADGES = [
  {
    id: 1,
    type: 'foundation',
    awarded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    metadata: { habit_name: 'Morning Exercise' }
  },
  {
    id: 2,
    type: 'streak_7',
    awarded_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    metadata: { streak_length: 7, habit_name: 'Reading' }
  }
]

class BadgeService {
  constructor() {
    this.badges = this.loadBadges()
    this.listeners = []
  }

  loadBadges() {
    const stored = localStorage.getItem('eurekia_badges')
    return stored ? JSON.parse(stored) : [...DEMO_BADGES]
  }

  saveBadges() {
    localStorage.setItem('eurekia_badges', JSON.stringify(this.badges))
    this.notifyListeners()
  }

  addListener(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.badges))
  }

  getUserBadges(userId = 'demo') {
    return this.badges.filter(badge => badge.user_id === userId || !badge.user_id)
  }

  // Check if user should receive a badge based on activity
  checkForNewBadges(habitData, userData) {
    const newBadges = []

    // Foundation Badge - first habit created
    if (habitData.total_habits === 1 && !this.hasBadge('foundation')) {
      newBadges.push(this.createBadge('foundation', {
        habit_name: habitData.first_habit_name
      }))
    }

    // Consistency Badge - 5 consecutive days
    if (habitData.consecutive_days >= 5 && !this.hasBadge('consistency')) {
      newBadges.push(this.createBadge('consistency', {
        consecutive_days: habitData.consecutive_days
      }))
    }

    // 7-Day Streak Badge
    if (habitData.current_streak >= 7 && !this.hasBadge('streak_7')) {
      newBadges.push(this.createBadge('streak_7', {
        streak_length: habitData.current_streak,
        habit_name: habitData.streak_habit_name
      }))
    }

    // 30-Day Streak Badge
    if (habitData.current_streak >= 30 && !this.hasBadge('streak_30')) {
      newBadges.push(this.createBadge('streak_30', {
        streak_length: habitData.current_streak,
        habit_name: habitData.streak_habit_name
      }))
    }

    // Comeback Badge - returned after 3+ day break
    if (habitData.comeback_days >= 3 && !this.hasRecentBadge('comeback', 7)) {
      newBadges.push(this.createBadge('comeback', {
        days_away: habitData.comeback_days,
        habit_name: habitData.comeback_habit_name
      }))
    }

    // Mission Complete Badge
    if (userData.missions_completed >= 1 && !this.hasBadge('mission_complete')) {
      newBadges.push(this.createBadge('mission_complete', {
        mission_name: userData.last_completed_mission
      }))
    }

    if (newBadges.length > 0) {
      this.badges.push(...newBadges)
      this.saveBadges()
      this.showBadgeNotifications(newBadges)
    }

    return newBadges
  }

  createBadge(type, metadata = {}) {
    return {
      id: Date.now() + Math.random(),
      type,
      awarded_at: new Date().toISOString(),
      metadata,
      user_id: 'demo',
      isNew: true
    }
  }

  hasBadge(type) {
    return this.badges.some(badge => badge.type === type)
  }

  hasRecentBadge(type, days) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return this.badges.some(badge => 
      badge.type === type && new Date(badge.awarded_at) > cutoff
    )
  }

  showBadgeNotifications(badges) {
    badges.forEach((badge, index) => {
      setTimeout(() => {
        this.showBadgeToast(badge)
      }, index * 2000) // Stagger notifications
    })
  }

  showBadgeToast(badge) {
    const badgeConfig = {
      foundation: { emoji: '🏗️', name: 'Foundation Builder' },
      consistency: { emoji: '⚡', name: 'Consistency Master' },
      streak_7: { emoji: '🔥', name: 'Week Warrior' },
      streak_30: { emoji: '👑', name: 'Monthly Master' },
      comeback: { emoji: '💪', name: 'Comeback Hero' },
      mission_complete: { emoji: '🏆', name: 'Mission Complete' }
    }

    const config = badgeConfig[badge.type] || { emoji: '🎖️', name: 'Achievement' }

    toast.custom((t) => (
      <div className={`
        bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6 rounded-2xl shadow-2xl
        transform transition-all duration-300 ${t.visible ? 'animate-bounce' : 'opacity-0'}
        border-4 border-white/20 max-w-sm
      `}>
        <div className="text-center">
          <div className="text-6xl mb-2 animate-spin-slow">{config.emoji}</div>
          <h3 className="text-xl font-bold mb-2">🎉 New Badge Earned!</h3>
          <h4 className="text-lg font-semibold mb-2">{config.name}</h4>
          <p className="text-white/90 text-sm mb-4">
            {badge.metadata.habit_name ? 
              `For your "${badge.metadata.habit_name}" habit!` :
              'Keep up the amazing work!'
            }
          </p>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Awesome! 🌟
          </button>
        </div>
      </div>
    ), {
      duration: 8000,
      position: 'top-center',
    })
  }

  // Simulate API endpoints for testing
  async fetchUserBadges(userId = 'demo') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      badges: this.getUserBadges(userId),
      total_count: this.badges.length
    }
  }

  async awardBadge(type, metadata = {}) {
    const badge = this.createBadge(type, metadata)
    this.badges.push(badge)
    this.saveBadges()
    this.showBadgeToast(badge)
    return badge
  }

  // Reset badges for testing
  resetBadges() {
    this.badges = [...DEMO_BADGES]
    this.saveBadges()
  }

  // Get badge statistics
  getBadgeStats() {
    const stats = {
      total: this.badges.length,
      byType: {},
      byRarity: {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0
      }
    }

    const rarityMap = {
      foundation: 'common',
      consistency: 'uncommon',
      streak_7: 'uncommon',
      streak_30: 'rare',
      comeback: 'uncommon',
      mission_complete: 'epic'
    }

    this.badges.forEach(badge => {
      stats.byType[badge.type] = (stats.byType[badge.type] || 0) + 1
      const rarity = rarityMap[badge.type] || 'common'
      stats.byRarity[rarity]++
    })

    return stats
  }
}

// Export singleton instance
export default new BadgeService()