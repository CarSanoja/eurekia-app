import toast from 'react-hot-toast'
import apiService from './apiService'

// Badge configuration for frontend display
const BADGE_CONFIG = {
  foundation: {
    emoji: '🏗️',
    name: 'Foundation Builder',
    description: 'Created your first habit',
    longDescription: 'Every great journey begins with a single step. You\'ve laid the foundation for your hero transformation!',
    color: 'from-blue-500 to-blue-600',
    rarity: 'common',
    tips: ['Start with small, achievable habits', 'Consistency beats perfection', 'Track your progress daily']
  },
  consistency: {
    emoji: '⚡',
    name: 'Consistency Master',
    description: 'Completed 5 habits in a row',
    longDescription: 'You\'re showing incredible consistency! Small daily actions lead to extraordinary results.',
    color: 'from-yellow-500 to-yellow-600',
    rarity: 'uncommon',
    tips: ['Celebrate small wins', 'Build habit chains', 'Use visual reminders']
  },
  streak_7: {
    emoji: '🔥',
    name: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    longDescription: 'A full week of dedication! You\'re proving that you can stick to your commitments.',
    color: 'from-orange-500 to-red-500',
    rarity: 'uncommon',
    tips: ['Prepare for obstacles', 'Have backup plans', 'Focus on progress, not perfection']
  },
  streak_30: {
    emoji: '👑',
    name: 'Monthly Master',
    description: 'Achieved a 30-day streak',
    longDescription: 'Incredible! You\'ve maintained your habit for an entire month. You\'re building true mastery!',
    color: 'from-purple-500 to-pink-500',
    rarity: 'rare',
    tips: ['Scale up your habits', 'Add new challenges', 'Inspire others with your success']
  },
  comeback: {
    emoji: '💪',
    name: 'Comeback Hero',
    description: 'Bounced back after a break',
    longDescription: 'Resilience is your superpower! Coming back after a setback shows true hero strength.',
    color: 'from-green-500 to-emerald-600',
    rarity: 'uncommon',
    tips: ['Learn from setbacks', 'Start fresh each day', 'Use failure as fuel for success']
  },
  mission_complete: {
    emoji: '🏆',
    name: 'Mission Complete',
    description: 'Completed your first mission',
    longDescription: 'Outstanding achievement! You\'ve completed your mission and proven your dedication to growth.',
    color: 'from-gold-500 to-yellow-500',
    rarity: 'epic',
    tips: ['Set bigger goals', 'Share your success', 'Help others on their journey']
  }
}

class BadgeService {
  constructor() {
    this.listeners = []
  }

  addListener(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  notifyListeners(badges) {
    this.listeners.forEach(listener => listener(badges))
  }

  // Real API methods
  async fetchUserBadges() {
    try {
      const badges = await apiService.getBadges()
      this.notifyListeners(badges)
      return { badges, total_count: badges.length }
    } catch (error) {
      console.error('Failed to fetch badges:', error)
      // Return empty badges on error
      return { badges: [], total_count: 0 }
    }
  }

  async getBadgeStats() {
    try {
      const stats = await apiService.getBadgeStats()
      
      // Transform backend stats to match frontend expectations
      const rarityMap = {
        foundation: 'common',
        consistency: 'uncommon',
        streak_7: 'uncommon',
        streak_30: 'rare',
        comeback: 'uncommon',
        mission_complete: 'epic'
      }

      const rarityStats = {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0
      }

      // Count badges by rarity
      Object.entries(stats.badges_by_type).forEach(([type, count]) => {
        const rarity = rarityMap[type] || 'common'
        rarityStats[rarity] += count
      })

      return {
        total: stats.total_badges,
        byType: stats.badges_by_type,
        byRarity: rarityStats,
        recent: stats.recent_badges
      }
    } catch (error) {
      console.error('Failed to fetch badge stats:', error)
      return {
        total: 0,
        byType: {},
        byRarity: { common: 0, uncommon: 0, rare: 0, epic: 0 },
        recent: []
      }
    }
  }

  // Badge display helpers
  getBadgeConfig(type) {
    return BADGE_CONFIG[type] || {
      emoji: '🎖️',
      name: 'Unknown Badge',
      description: 'Special achievement',
      longDescription: 'You\'ve earned a special badge for your efforts!',
      color: 'from-gray-500 to-gray-600',
      rarity: 'common',
      tips: []
    }
  }

  showBadgeToast(badge) {
    const config = this.getBadgeConfig(badge.type)

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
            {badge.metadata?.habit_name ? 
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

  // Check for new badges (would be called after habit actions)
  async checkForNewBadges() {
    try {
      // In a real implementation, this might be triggered by backend events
      // or called after significant habit actions
      const { badges } = await this.fetchUserBadges()
      
      // Check for recently earned badges (last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      const newBadges = badges.filter(badge => 
        new Date(badge.awarded_at) > fiveMinutesAgo
      )

      if (newBadges.length > 0) {
        // Show notifications for new badges
        newBadges.forEach((badge, index) => {
          setTimeout(() => {
            this.showBadgeToast(badge)
          }, index * 2000)
        })
      }

      return newBadges
    } catch (error) {
      console.error('Failed to check for new badges:', error)
      return []
    }
  }

  // Test method for development
  async testBadgeNotification() {
    const testBadge = {
      type: 'foundation',
      awarded_at: new Date().toISOString(),
      metadata: { habit_name: 'Test Habit' }
    }
    this.showBadgeToast(testBadge)
  }
}

// Export singleton instance
export default new BadgeService()