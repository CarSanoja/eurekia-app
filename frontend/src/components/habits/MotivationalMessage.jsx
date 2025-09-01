import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MotivationalMessage = ({ message, type = 'default' }) => {
  const [isVisible, setIsVisible] = useState(true);

  const getMessageStyle = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-100 to-emerald-100',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: '🎉'
        };
      case 'streak':
        return {
          bg: 'bg-gradient-to-r from-orange-100 to-red-100',
          border: 'border-orange-200',
          text: 'text-orange-800',
          icon: '🔥'
        };
      case 'milestone':
        return {
          bg: 'bg-gradient-to-r from-purple-100 to-pink-100',
          border: 'border-purple-200',
          text: 'text-purple-800',
          icon: '🏆'
        };
      case 'comeback':
        return {
          bg: 'bg-gradient-to-r from-blue-100 to-indigo-100',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: '💪'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-100 to-slate-100',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: '✨'
        };
    }
  };

  const style = getMessageStyle(type);

  useEffect(() => {
    // Auto-hide after 8 seconds unless it's a comeback message
    if (type !== 'comeback') {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [type]);

  if (!message || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`
          ${style.bg} ${style.border} ${style.text} 
          rounded-xl p-4 border-2 shadow-sm mb-4 relative overflow-hidden
        `}
      >
        {/* Background decoration */}
        <motion.div 
          className="absolute -top-2 -right-2 text-6xl opacity-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {style.icon}
        </motion.div>

        <div className="flex items-start gap-3 relative z-10">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatDelay: 3 
            }}
            className="text-2xl mt-0.5"
          >
            {style.icon}
          </motion.div>
          
          <div className="flex-1">
            <p className="font-medium leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="opacity-50 hover:opacity-100 transition-opacity p-1 -mt-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar for auto-hide (only for non-comeback messages) */}
        {type !== 'comeback' && (
          <motion.div 
            className="absolute bottom-0 left-0 h-1 bg-current opacity-20"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 8, ease: "linear" }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default MotivationalMessage;