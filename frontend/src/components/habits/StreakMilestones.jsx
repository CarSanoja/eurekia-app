import React from 'react';
import { motion } from 'framer-motion';

const StreakMilestones = ({ habit }) => {
  const milestones = [
    { days: 1, emoji: '🌱', title: 'First Step', color: 'green' },
    { days: 3, emoji: '🔥', title: 'Getting Hot', color: 'orange' },
    { days: 7, emoji: '⭐', title: 'One Week', color: 'yellow' },
    { days: 14, emoji: '💪', title: 'Two Weeks', color: 'blue' },
    { days: 21, emoji: '🏆', title: 'Habit Formed', color: 'purple' },
    { days: 30, emoji: '👑', title: 'One Month', color: 'indigo' },
    { days: 60, emoji: '🎯', title: 'Two Months', color: 'pink' },
    { days: 100, emoji: '💎', title: 'Century', color: 'cyan' },
  ];

  const getColorClasses = (color, isAchieved, isNext) => {
    const colors = {
      green: isAchieved ? 'bg-green-100 text-green-800 border-green-200' 
             : isNext ? 'bg-green-50 text-green-600 border-green-200 border-dashed'
             : 'bg-gray-50 text-gray-400 border-gray-200',
      orange: isAchieved ? 'bg-orange-100 text-orange-800 border-orange-200'
              : isNext ? 'bg-orange-50 text-orange-600 border-orange-200 border-dashed'
              : 'bg-gray-50 text-gray-400 border-gray-200',
      yellow: isAchieved ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
              : isNext ? 'bg-yellow-50 text-yellow-600 border-yellow-200 border-dashed'
              : 'bg-gray-50 text-gray-400 border-gray-200',
      blue: isAchieved ? 'bg-blue-100 text-blue-800 border-blue-200'
            : isNext ? 'bg-blue-50 text-blue-600 border-blue-200 border-dashed'
            : 'bg-gray-50 text-gray-400 border-gray-200',
      purple: isAchieved ? 'bg-purple-100 text-purple-800 border-purple-200'
              : isNext ? 'bg-purple-50 text-purple-600 border-purple-200 border-dashed'
              : 'bg-gray-50 text-gray-400 border-gray-200',
      indigo: isAchieved ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
              : isNext ? 'bg-indigo-50 text-indigo-600 border-indigo-200 border-dashed'
              : 'bg-gray-50 text-gray-400 border-gray-200',
      pink: isAchieved ? 'bg-pink-100 text-pink-800 border-pink-200'
            : isNext ? 'bg-pink-50 text-pink-600 border-pink-200 border-dashed'
            : 'bg-gray-50 text-gray-400 border-gray-200',
      cyan: isAchieved ? 'bg-cyan-100 text-cyan-800 border-cyan-200'
            : isNext ? 'bg-cyan-50 text-cyan-600 border-cyan-200 border-dashed'
            : 'bg-gray-50 text-gray-400 border-gray-200',
    };
    return colors[color];
  };

  const currentStreak = habit.current_streak || 0;
  const nextMilestone = milestones.find(m => m.days > currentStreak) || milestones[milestones.length - 1];

  return (
    <div className="space-y-4">
      {/* Next Milestone Progress */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{nextMilestone.emoji}</div>
          <div>
            <div className="font-bold text-gray-900">{nextMilestone.title}</div>
            <div className="text-sm text-gray-600">
              {currentStreak}/{nextMilestone.days} days
            </div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            className="bg-gradient-to-r from-purple-400 to-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((currentStreak / nextMilestone.days) * 100, 100)}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        
        <div className="text-xs text-center text-gray-600 mt-2">
          {nextMilestone.days - currentStreak} more days to unlock!
        </div>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {milestones.map((milestone, index) => {
          const isAchieved = currentStreak >= milestone.days;
          const isNext = milestone.days === nextMilestone.days;
          
          return (
            <motion.div
              key={milestone.days}
              className={`
                p-3 rounded-xl border-2 text-center transition-all
                ${getColorClasses(milestone.color, isAchieved, isNext)}
              `}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: isAchieved ? 1.05 : 1 }}
            >
              <motion.div 
                className="text-2xl mb-1"
                animate={isAchieved ? { 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1] 
                } : {}}
                transition={{ 
                  duration: 0.5, 
                  repeat: isAchieved ? Infinity : 0, 
                  repeatDelay: 3 
                }}
              >
                {milestone.emoji}
              </motion.div>
              
              <div className="font-bold text-sm mb-1">{milestone.title}</div>
              <div className="text-xs opacity-75">{milestone.days} days</div>
              
              {isAchieved && (
                <motion.div
                  className="text-xs mt-1 font-medium"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  ✓ Achieved!
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Encouragement */}
      <motion.div 
        className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {currentStreak === 0 && "🌟 Start your journey! Every expert was once a beginner."}
        {currentStreak >= 1 && currentStreak < 7 && "🚀 You're building momentum! Keep pushing forward."}
        {currentStreak >= 7 && currentStreak < 21 && "🔥 You're on fire! This is becoming second nature."}
        {currentStreak >= 21 && "👑 You're a habit master! Your consistency is inspiring."}
      </motion.div>
    </div>
  );
};

export default StreakMilestones;