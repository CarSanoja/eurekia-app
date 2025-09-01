import api from './api';

class AnalyticsService {
  constructor() {
    this.sessionId = null;
    this.isInitialized = false;
    this.eventQueue = [];
    this.currentUser = null;
  }

  // Initialize analytics service
  async initialize(user) {
    if (this.isInitialized && this.currentUser?.id === user?.id) {
      return;
    }

    this.currentUser = user;
    this.isInitialized = true;

    try {
      // Start a new session
      const response = await api.post('/analytics/session/start/');
      this.sessionId = response.data.session_id;
      
      // Process any queued events
      await this.processEventQueue();
      
      // Set up page visibility change listener
      this.setupVisibilityChangeListener();
      
      // Set up beforeunload listener to end session
      this.setupBeforeUnloadListener();

    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  // Track a custom event
  async trackEvent(eventType, eventData = {}, pageUrl = null) {
    const event = {
      event_type: eventType,
      event_data: eventData,
      session_id: this.sessionId,
      page_path: pageUrl || window.location.pathname
    };

    if (!this.isInitialized) {
      // Queue the event for later processing
      this.eventQueue.push(event);
      return;
    }

    try {
      await api.post('/analytics/track/', event);
    } catch (error) {
      console.error('Failed to track event:', error);
      // Re-queue the event for retry
      this.eventQueue.push(event);
    }
  }

  // Track page view
  async trackPageView(pageUrl = null) {
    const url = pageUrl || window.location.pathname;
    await this.trackEvent('page_view', { page_path: url }, url);
  }

  // Track feature usage with time spent
  async trackFeatureUsage(feature, timeSpentSeconds = 0) {
    try {
      await api.post('/analytics/features/', {
        feature,
        time_spent_seconds: timeSpentSeconds
      });
    } catch (error) {
      console.error('Failed to track feature usage:', error);
    }
  }

  // Authentication events
  async trackUserRegistration(registrationData = {}) {
    await this.trackEvent('user_registered', registrationData);
  }

  async trackUserLogin() {
    await this.trackEvent('user_login');
  }

  async trackUserLogout() {
    await this.trackEvent('user_logout');
    await this.endSession();
  }

  // Habit events
  async trackHabitCreated(habitData) {
    await this.trackEvent('habit_created', {
      habit_id: habitData.id,
      title: habitData.title,
      cadence: habitData.cadence,
      difficulty_level: habitData.difficulty_level
    });
  }

  async trackHabitCompleted(habitData) {
    await this.trackEvent('habit_completed', {
      habit_id: habitData.id,
      title: habitData.title,
      current_streak: habitData.current_streak
    });
  }

  async trackHabitSkipped(habitData) {
    await this.trackEvent('habit_skipped', {
      habit_id: habitData.id,
      title: habitData.title
    });
  }

  async trackStreakMilestone(habitData, milestone) {
    await this.trackEvent('streak_milestone', {
      habit_id: habitData.id,
      title: habitData.title,
      milestone_days: milestone,
      current_streak: habitData.current_streak
    });
  }

  async trackInsuranceUsed(habitData) {
    await this.trackEvent('insurance_used', {
      habit_id: habitData.id,
      title: habitData.title,
      current_streak: habitData.current_streak
    });
  }

  async trackComeback(habitData, daysAway) {
    await this.trackEvent('comeback_detected', {
      habit_id: habitData.id,
      title: habitData.title,
      days_away: daysAway
    });
  }

  // Mission and Vision events
  async trackMissionCreated(missionData) {
    await this.trackEvent('mission_created', {
      skill: missionData.skill?.substring(0, 100), // Limit length for privacy
      weakness: missionData.weakness?.substring(0, 100)
    });
  }

  async trackVisionCreated(visionData) {
    await this.trackEvent('vision_created', {
      tags_count: visionData.tags?.length || 0,
      has_image: !!visionData.image_url
    });
  }

  // Mood and wellness events
  async trackMoodRecorded(moodData) {
    await this.trackEvent('mood_recorded', {
      score: moodData.score,
      has_note: !!moodData.note
    });
  }

  async trackTriggerRecorded(triggerData) {
    await this.trackEvent('trigger_recorded', {
      has_response: !!triggerData.response,
      tags_count: triggerData.tags?.length || 0
    });
  }

  // Engagement events
  async trackNotificationClicked(notificationType) {
    await this.trackEvent('notification_clicked', {
      notification_type: notificationType
    });
  }

  async trackReportGenerated(reportType) {
    await this.trackEvent('report_generated', {
      report_type: reportType
    });
  }

  async trackSettingsChanged(settingType, newValue) {
    await this.trackEvent('settings_changed', {
      setting_type: settingType,
      new_value: typeof newValue === 'boolean' ? newValue : 'changed'
    });
  }

  // Gamification events
  async trackBadgeEarned(badgeType) {
    await this.trackEvent('badge_earned', {
      badge_type: badgeType
    });
  }

  async trackMilestoneCelebrated(milestone) {
    await this.trackEvent('milestone_celebrated', {
      milestone_type: milestone.type,
      milestone_value: milestone.value
    });
  }

  async trackAchievementUnlocked(achievementType) {
    await this.trackEvent('achievement_unlocked', {
      achievement_type: achievementType
    });
  }

  // Feature usage tracking with automatic timing
  startFeatureTimer(feature) {
    this.featureTimers = this.featureTimers || {};
    this.featureTimers[feature] = Date.now();
  }

  async endFeatureTimer(feature) {
    if (this.featureTimers && this.featureTimers[feature]) {
      const timeSpent = Math.floor((Date.now() - this.featureTimers[feature]) / 1000);
      await this.trackFeatureUsage(feature, timeSpent);
      delete this.featureTimers[feature];
    } else {
      // Track usage without timing
      await this.trackFeatureUsage(feature, 0);
    }
  }

  // Session management
  async endSession() {
    if (this.sessionId) {
      try {
        await api.post('/analytics/session/end/', {
          session_id: this.sessionId
        });
      } catch (error) {
        console.error('Failed to end session:', error);
      }
      this.sessionId = null;
    }
  }

  // Get user analytics summary
  async getUserAnalytics() {
    try {
      const response = await api.get('/analytics/user/summary/');
      return response.data;
    } catch (error) {
      console.error('Failed to get user analytics:', error);
      return null;
    }
  }

  // Get user engagement metrics
  async getUserEngagementMetrics() {
    try {
      const response = await api.get('/analytics/user/engagement/');
      return response.data;
    } catch (error) {
      console.error('Failed to get engagement metrics:', error);
      return null;
    }
  }

  // Private methods
  async processEventQueue() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    for (const event of events) {
      try {
        await api.post('/analytics/track/', {
          ...event,
          session_id: this.sessionId
        });
      } catch (error) {
        console.error('Failed to process queued event:', error);
        // Re-queue failed events
        this.eventQueue.push(event);
      }
    }
  }

  setupVisibilityChangeListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, potentially track session pause
        this.trackEvent('page_hidden');
      } else {
        // Page is visible again
        this.trackEvent('page_visible');
      }
    });
  }

  setupBeforeUnloadListener() {
    window.addEventListener('beforeunload', () => {
      // Use sendBeacon for reliable event sending on page unload
      if (this.sessionId && navigator.sendBeacon) {
        const data = JSON.stringify({
          event_type: 'session_end',
          session_id: this.sessionId,
          event_data: { reason: 'page_unload' }
        });
        
        navigator.sendBeacon('/api/analytics/track/', data);
      }
    });
  }
}

// Create singleton instance
const analytics = new AnalyticsService();

// Enhanced hook-style functions for React components
export const useAnalytics = () => {
  return {
    // Core tracking functions
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    
    // Authentication
    trackUserRegistration: analytics.trackUserRegistration.bind(analytics),
    trackUserLogin: analytics.trackUserLogin.bind(analytics),
    trackUserLogout: analytics.trackUserLogout.bind(analytics),
    
    // Habits
    trackHabitCreated: analytics.trackHabitCreated.bind(analytics),
    trackHabitCompleted: analytics.trackHabitCompleted.bind(analytics),
    trackHabitSkipped: analytics.trackHabitSkipped.bind(analytics),
    trackStreakMilestone: analytics.trackStreakMilestone.bind(analytics),
    trackInsuranceUsed: analytics.trackInsuranceUsed.bind(analytics),
    trackComeback: analytics.trackComeback.bind(analytics),
    
    // Mission & Vision
    trackMissionCreated: analytics.trackMissionCreated.bind(analytics),
    trackVisionCreated: analytics.trackVisionCreated.bind(analytics),
    
    // Mood & Wellness
    trackMoodRecorded: analytics.trackMoodRecorded.bind(analytics),
    trackTriggerRecorded: analytics.trackTriggerRecorded.bind(analytics),
    
    // Engagement
    trackNotificationClicked: analytics.trackNotificationClicked.bind(analytics),
    trackReportGenerated: analytics.trackReportGenerated.bind(analytics),
    trackSettingsChanged: analytics.trackSettingsChanged.bind(analytics),
    
    // Gamification
    trackBadgeEarned: analytics.trackBadgeEarned.bind(analytics),
    trackMilestoneCelebrated: analytics.trackMilestoneCelebrated.bind(analytics),
    trackAchievementUnlocked: analytics.trackAchievementUnlocked.bind(analytics),
    
    // Feature timing
    startFeatureTimer: analytics.startFeatureTimer.bind(analytics),
    endFeatureTimer: analytics.endFeatureTimer.bind(analytics),
    
    // Data retrieval
    getUserAnalytics: analytics.getUserAnalytics.bind(analytics),
    getUserEngagementMetrics: analytics.getUserEngagementMetrics.bind(analytics)
  };
};

// Auto-initialize when user is available
export const initializeAnalytics = (user) => {
  analytics.initialize(user);
};

export default analytics;