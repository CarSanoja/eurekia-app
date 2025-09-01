import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics as useAnalyticsService, initializeAnalytics } from '../utils/analytics';

export const useAnalytics = () => {
  const analytics = useAnalyticsService();
  const location = useLocation();
  const { user } = useAuth();
  const lastLocationRef = useRef(location.pathname);
  const featureTimersRef = useRef({});

  // Initialize analytics when user is available
  useEffect(() => {
    if (user) {
      initializeAnalytics(user);
    }
  }, [user]);

  // Track page views on route changes
  useEffect(() => {
    if (user && location.pathname !== lastLocationRef.current) {
      analytics.trackPageView(location.pathname);
      lastLocationRef.current = location.pathname;
    }
  }, [location.pathname, user, analytics]);

  // Enhanced analytics functions with automatic feature detection
  const trackFeatureUsage = (feature, timeSpent = 0) => {
    if (user) {
      analytics.trackFeatureUsage(feature, timeSpent);
    }
  };

  const withFeatureTracking = (feature, callback) => {
    return async (...args) => {
      if (user) {
        analytics.startFeatureTimer(feature);
        
        try {
          const result = await callback(...args);
          await analytics.endFeatureTimer(feature);
          return result;
        } catch (error) {
          await analytics.endFeatureTimer(feature);
          throw error;
        }
      } else {
        return callback(...args);
      }
    };
  };

  // Habit-specific analytics with automatic feature tracking
  const trackHabitAction = {
    created: (habitData) => {
      if (user) {
        analytics.trackHabitCreated(habitData);
        trackFeatureUsage('habits');
      }
    },
    completed: (habitData) => {
      if (user) {
        analytics.trackHabitCompleted(habitData);
        trackFeatureUsage('habits');
      }
    },
    skipped: (habitData) => {
      if (user) {
        analytics.trackHabitSkipped(habitData);
        trackFeatureUsage('habits');
      }
    },
    streakMilestone: (habitData, milestone) => {
      if (user) {
        analytics.trackStreakMilestone(habitData, milestone);
        analytics.trackMilestoneCelebrated({
          type: 'streak',
          value: milestone
        });
      }
    },
    insuranceUsed: (habitData) => {
      if (user) {
        analytics.trackInsuranceUsed(habitData);
        trackFeatureUsage('streak_insurance');
      }
    },
    comeback: (habitData, daysAway) => {
      if (user) {
        analytics.trackComeback(habitData, daysAway);
      }
    }
  };

  // Mission and Vision tracking
  const trackMissionVision = {
    missionCreated: (missionData) => {
      if (user) {
        analytics.trackMissionCreated(missionData);
        trackFeatureUsage('mission_vision');
      }
    },
    visionCreated: (visionData) => {
      if (user) {
        analytics.trackVisionCreated(visionData);
        trackFeatureUsage('mission_vision');
      }
    }
  };

  // Mood tracking
  const trackMood = {
    recorded: (moodData) => {
      if (user) {
        analytics.trackMoodRecorded(moodData);
        trackFeatureUsage('mood_tracking');
      }
    },
    triggerRecorded: (triggerData) => {
      if (user) {
        analytics.trackTriggerRecorded(triggerData);
        trackFeatureUsage('mood_tracking');
      }
    }
  };

  // Engagement tracking
  const trackEngagement = {
    notificationClicked: (type) => {
      if (user) {
        analytics.trackNotificationClicked(type);
        trackFeatureUsage('notifications');
      }
    },
    reportGenerated: (type) => {
      if (user) {
        analytics.trackReportGenerated(type);
        trackFeatureUsage('reports');
      }
    },
    settingsChanged: (settingType, newValue) => {
      if (user) {
        analytics.trackSettingsChanged(settingType, newValue);
        trackFeatureUsage('settings');
      }
    }
  };

  // Onboarding tracking
  const trackOnboarding = {
    stepCompleted: (step, data = {}) => {
      if (user) {
        analytics.trackEvent('onboarding_step_completed', {
          step,
          ...data
        });
        trackFeatureUsage('onboarding');
      }
    },
    completed: () => {
      if (user) {
        analytics.trackEvent('onboarding_completed');
        analytics.trackAchievementUnlocked('onboarding_complete');
      }
    }
  };

  return {
    // Core analytics
    ...analytics,
    
    // Enhanced tracking functions
    trackFeatureUsage,
    withFeatureTracking,
    
    // Categorized tracking
    trackHabitAction,
    trackMissionVision,
    trackMood,
    trackEngagement,
    trackOnboarding,
    
    // Utility functions
    isEnabled: !!user
  };
};

// Higher-order component for automatic feature tracking
export const withAnalyticsTracking = (Component, feature) => {
  return function AnalyticsWrappedComponent(props) {
    const { startFeatureTimer, endFeatureTimer, isEnabled } = useAnalytics();

    useEffect(() => {
      if (isEnabled && feature) {
        startFeatureTimer(feature);
        
        return () => {
          endFeatureTimer(feature);
        };
      }
    }, [isEnabled, feature, startFeatureTimer, endFeatureTimer]);

    return <Component {...props} />;
  };
};