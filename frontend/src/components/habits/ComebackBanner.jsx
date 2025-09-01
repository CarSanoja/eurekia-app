import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ComebackBanner = ({ comeback_status, motivational_message, onClose }) => {
  if (!comeback_status?.is_comeback) {
    return null;
  }

  const getBannerStyle = (level) => {
    switch (level) {
      case 'major':
        return {
          bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
          icon: '🌟',
          animation: 'bounce'
        };
      case 'moderate':
        return {
          bg: 'bg-gradient-to-r from-orange-500 to-red-500',
          icon: '💪',
          animation: 'pulse'
        };
      case 'minor':
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          icon: '🚀',
          animation: 'bounce'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-green-500 to-teal-500',
          icon: '✨',
          animation: 'pulse'
        };
    }
  };

  const style = getBannerStyle(comeback_status.level);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className={`${style.bg} rounded-2xl p-6 text-white shadow-lg border-2 border-white/20 relative overflow-hidden`}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="text-8xl rotate-12">{style.icon}</div>
        </div>
        
        <div className="relative z-10 flex items-start gap-4">
          <motion.div
            animate={{ 
              rotate: style.animation === 'bounce' ? [0, 10, -10, 0] : 0,
              scale: style.animation === 'pulse' ? [1, 1.1, 1] : 1
            }}
            transition={{ 
              duration: 1, 
              repeat: Infinity, 
              repeatDelay: 2 
            }}
            className="text-4xl"
          >
            {style.icon}
          </motion.div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              Comeback Time!
              {comeback_status.level === 'major' && '🎯'}
              {comeback_status.level === 'moderate' && '⚡'}
              {comeback_status.level === 'minor' && '🔥'}
            </h3>
            
            <p className="text-white/90 mb-4 leading-relaxed">
              {comeback_status.message}
            </p>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
                {comeback_status.days_since_last} days since last success
              </div>
              
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-white/20 rounded-full px-3 py-1 text-sm font-medium"
              >
                Time to bounce back! 💪
              </motion.div>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComebackBanner;