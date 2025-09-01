import React from 'react';
import { motion } from 'framer-motion';

const StreakDisplay = ({ habit }) => {
  const { current_streak, streak_stats, insurance_available, can_use_insurance } = habit;
  
  const getStreakEmoji = (streak) => {
    if (streak === 0) return '⚡';
    if (streak < 3) return '🔥';
    if (streak < 7) return '🔥🔥';
    if (streak < 21) return '🔥🔥🔥';
    return '🔥🔥🔥🔥';
  };

  const getStreakColor = (streak) => {
    if (streak === 0) return 'text-gray-400';
    if (streak < 3) return 'text-orange-500';
    if (streak < 7) return 'text-red-500';
    if (streak < 21) return 'text-red-600';
    return 'text-purple-600';
  };

  const getStreakBg = (streak) => {
    if (streak === 0) return 'bg-gray-100';
    if (streak < 3) return 'bg-orange-50';
    if (streak < 7) return 'bg-red-50';
    if (streak < 21) return 'bg-red-100';
    return 'bg-purple-50';
  };

  return (
    <motion.div 
      className={`p-4 rounded-xl ${getStreakBg(current_streak)} border-2 border-opacity-20`}
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Main Streak Display */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <motion.div 
            className="text-3xl"
            animate={{ rotate: current_streak > 0 ? [0, 5, -5, 0] : 0 }}
            transition={{ duration: 0.5, repeat: current_streak > 0 ? Infinity : 0, repeatDelay: 2 }}
          >
            {getStreakEmoji(current_streak)}
          </motion.div>
          <div>
            <div className={`text-2xl font-bold ${getStreakColor(current_streak)}`}>
              {current_streak}
            </div>
            <div className="text-sm text-gray-600">
              {current_streak === 1 ? 'day streak' : 'days streak'}
            </div>
          </div>
        </div>
        
        {/* Insurance Badge */}
        {insurance_available > 0 && (
          <motion.div 
            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            🛡️ {insurance_available} insurance
          </motion.div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress to next milestone</span>
          <span>{current_streak % 7}/7 days</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((current_streak % 7) / 7) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      {streak_stats && (
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/50 rounded-lg p-2">
            <div className="font-bold text-lg text-purple-600">
              {streak_stats.longest_streak}
            </div>
            <div className="text-xs text-gray-600">Best Streak</div>
          </div>
          <div className="bg-white/50 rounded-lg p-2">
            <div className="font-bold text-lg text-green-600">
              {streak_stats.completion_rate}%
            </div>
            <div className="text-xs text-gray-600">Success Rate</div>
          </div>
          <div className="bg-white/50 rounded-lg p-2">
            <div className="font-bold text-lg text-blue-600">
              {streak_stats.total_completions}
            </div>
            <div className="text-xs text-gray-600">Total Done</div>
          </div>
        </div>
      )}

      {/* Motivational Messages */}
      <motion.div 
        className="mt-3 text-center text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {current_streak === 0 && (
          <span className="text-gray-600">🌟 Ready to start your streak? You've got this!</span>
        )}
        {current_streak === 1 && (
          <span className="text-orange-600">🎉 Great start! One day closer to your goal!</span>
        )}
        {current_streak >= 2 && current_streak < 7 && (
          <span className="text-red-600">🚀 Momentum building! Keep it going!</span>
        )}
        {current_streak >= 7 && current_streak < 21 && (
          <span className="text-red-700">🏆 You're on fire! This is becoming a habit!</span>
        )}
        {current_streak >= 21 && (
          <span className="text-purple-600">👑 Streak master! You're absolutely crushing it!</span>
        )}
      </motion.div>
    </motion.div>
  );
};

export default StreakDisplay;