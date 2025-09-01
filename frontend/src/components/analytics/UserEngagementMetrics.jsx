import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAnalytics } from '../../hooks/useAnalytics';

const UserEngagementMetrics = ({ showDetailed = false }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getUserEngagementMetrics, isEnabled } = useAnalytics();

  useEffect(() => {
    if (isEnabled) {
      loadMetrics();
    }
  }, [isEnabled]);

  const loadMetrics = async () => {
    try {
      const data = await getUserEngagementMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load engagement metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isEnabled || loading) {
    return showDetailed ? (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ) : null;
  }

  if (!metrics) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getScoreEmoji = (score) => {
    if (score >= 90) return '🔥';
    if (score >= 80) return '⭐';
    if (score >= 70) return '👍';
    if (score >= 60) return '📈';
    if (score >= 50) return '🎯';
    return '💪';
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!showDetailed) {
    // Compact view for dashboard
    return (
      <div className="grid grid-cols-2 gap-3">
        {/* Activity Score */}
        <motion.div 
          className={`p-3 rounded-xl ${getScoreBg(metrics.activity_score)} border`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">{getScoreEmoji(metrics.activity_score)}</span>
            <div>
              <div className={`text-lg font-bold ${getScoreColor(metrics.activity_score)}`}>
                {Math.round(metrics.activity_score)}
              </div>
              <div className="text-xs text-gray-600">Activity</div>
            </div>
          </div>
        </motion.div>

        {/* Habit Consistency */}
        <motion.div 
          className={`p-3 rounded-xl ${getScoreBg(metrics.habit_consistency_score)} border`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <div>
              <div className={`text-lg font-bold ${getScoreColor(metrics.habit_consistency_score)}`}>
                {Math.round(metrics.habit_consistency_score)}
              </div>
              <div className="text-xs text-gray-600">Habits</div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Detailed view for settings/profile page
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        📊 Your Engagement Metrics
      </h3>

      {/* Main Scores Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div 
          className={`p-4 rounded-xl ${getScoreBg(metrics.activity_score)} border-2 border-opacity-20`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">{getScoreEmoji(metrics.activity_score)}</div>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.activity_score)}`}>
              {Math.round(metrics.activity_score)}
            </div>
            <div className="text-sm text-gray-600">Activity Score</div>
            <div className="text-xs text-gray-500 mt-1">
              Based on recent activity
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={`p-4 rounded-xl ${getScoreBg(metrics.habit_consistency_score)} border-2 border-opacity-20`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🏆</div>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.habit_consistency_score)}`}>
              {Math.round(metrics.habit_consistency_score)}
            </div>
            <div className="text-sm text-gray-600">Habit Consistency</div>
            <div className="text-xs text-gray-500 mt-1">
              Completion rate + streaks
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={`p-4 rounded-xl ${getScoreBg(metrics.feature_adoption_score)} border-2 border-opacity-20`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.feature_adoption_score)}`}>
              {Math.round(metrics.feature_adoption_score)}
            </div>
            <div className="text-sm text-gray-600">Feature Adoption</div>
            <div className="text-xs text-gray-500 mt-1">
              Features discovered & used
            </div>
          </div>
        </motion.div>

        <motion.div 
          className={`p-4 rounded-xl ${getScoreBg(100 - metrics.retention_risk_score)} border-2 border-opacity-20`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">💎</div>
            <div className={`text-2xl font-bold ${getScoreColor(100 - metrics.retention_risk_score)}`}>
              {Math.round(100 - metrics.retention_risk_score)}
            </div>
            <div className="text-sm text-gray-600">Engagement</div>
            <div className="text-xs text-gray-500 mt-1">
              Overall engagement level
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detailed Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Activity Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            📅 Activity Overview
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Days since registration:</span>
              <span className="font-medium">{metrics.days_since_registration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Days active:</span>
              <span className="font-medium">{metrics.days_active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total sessions:</span>
              <span className="font-medium">{metrics.total_sessions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total time:</span>
              <span className="font-medium">{formatDuration(metrics.total_session_time_seconds)}</span>
            </div>
          </div>
        </div>

        {/* Habit Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            🎯 Habit Progress
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Habits created:</span>
              <span className="font-medium">{metrics.habits_created}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Habits completed:</span>
              <span className="font-medium">{metrics.habits_completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Currently active:</span>
              <span className="font-medium">{metrics.current_active_habits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Longest streak:</span>
              <span className="font-medium">{metrics.longest_streak} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          🏆 Achievements
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">{metrics.milestones_reached}</div>
            <div className="text-xs text-gray-600">Milestones</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{metrics.badges_earned}</div>
            <div className="text-xs text-gray-600">Badges</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{metrics.reports_generated}</div>
            <div className="text-xs text-gray-600">Reports</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{metrics.features_discovered}</div>
            <div className="text-xs text-gray-600">Features Used</div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          💡 Insights
        </h4>
        <div className="text-sm text-blue-800">
          {metrics.activity_score >= 80 && (
            <p className="mb-2">🔥 You're highly active! Keep up the excellent engagement.</p>
          )}
          {metrics.habit_consistency_score >= 80 && (
            <p className="mb-2">⭐ Outstanding habit consistency! You're building strong routines.</p>
          )}
          {metrics.feature_adoption_score < 60 && (
            <p className="mb-2">🎯 Try exploring more features to enhance your experience!</p>
          )}
          {metrics.retention_risk_score > 60 && (
            <p className="mb-2">💪 Consider setting up more habits or checking in more regularly.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEngagementMetrics;