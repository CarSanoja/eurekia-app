import toast from 'react-hot-toast';

// Streak milestone definitions
const STREAK_MILESTONES = [
  { days: 3, title: 'First Streak!', emoji: '🔥', message: 'You\'re on fire! 3 days in a row!' },
  { days: 7, title: 'One Week Wonder', emoji: '⭐', message: 'Amazing! You\'ve completed a full week!' },
  { days: 14, title: 'Two Week Warrior', emoji: '💪', message: 'You\'re getting stronger every day!' },
  { days: 21, title: 'Habit Hero', emoji: '🏆', message: 'Scientists say it takes 21 days to form a habit. You did it!' },
  { days: 30, title: 'Monthly Master', emoji: '👑', message: 'A full month! You\'re unstoppable!' },
  { days: 50, title: 'Halfway Hero', emoji: '🎯', message: 'Halfway to 100! You\'re incredible!' },
  { days: 100, title: 'Century Champion', emoji: '💎', message: 'WOW! 100 days! You\'re a true legend!' },
  { days: 365, title: 'Year of Excellence', emoji: '🌟', message: 'AN ENTIRE YEAR! You\'ve achieved something extraordinary!' },
];

// Insurance milestone notifications
const INSURANCE_MILESTONES = [
  { earned: 1, message: '🛡️ You earned your first streak insurance! Use it wisely.' },
  { earned: 5, message: '🛡️ 5 insurance earned! You\'re building a safety net.' },
  { earned: 10, message: '🛡️ 10 insurance collected! You\'re a streak protection master!' },
];

// Custom toast component for streak celebrations
const createStreakToast = (milestone) => {
  return toast.custom((t) => (
    <div
      className={`
        bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-2xl shadow-2xl
        transform transition-all duration-300 ${t.visible ? 'animate-bounce' : 'opacity-0'}
        border-4 border-white/20 max-w-sm
      `}
    >
      <div className="text-center">
        <div className="text-6xl mb-2 animate-spin-slow">{milestone.emoji}</div>
        <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
        <p className="text-white/90">{milestone.message}</p>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="mt-4 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          Awesome! ✨
        </button>
      </div>
    </div>
  ), {
    duration: 8000,
    position: 'top-center',
  });
};

// Custom toast for insurance earned
const createInsuranceToast = (message) => {
  return toast.custom((t) => (
    <div
      className={`
        bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl shadow-lg
        transform transition-all duration-300 ${t.visible ? 'scale-100' : 'scale-95 opacity-0'}
        border-2 border-white/20 max-w-sm
      `}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">🛡️</div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-white/70 hover:text-white text-xl"
        >
          ×
        </button>
      </div>
    </div>
  ), {
    duration: 6000,
    position: 'top-right',
  });
};

// Check for streak milestones and show notifications
export const checkStreakMilestones = (previousStreak, currentStreak, habitTitle) => {
  // Find milestones achieved with current streak that weren't achieved before
  const achievedMilestones = STREAK_MILESTONES.filter(
    milestone => currentStreak >= milestone.days && previousStreak < milestone.days
  );

  achievedMilestones.forEach(milestone => {
    // Customize message with habit title
    const customMilestone = {
      ...milestone,
      message: milestone.message + ` Your "${habitTitle}" streak is incredible!`
    };
    
    createStreakToast(customMilestone);
    
    // Add confetti effect for major milestones
    if (milestone.days >= 21) {
      triggerConfetti();
    }
  });

  return achievedMilestones.length > 0;
};

// Check for insurance milestones
export const checkInsuranceMilestones = (previousInsurance, currentInsurance) => {
  if (currentInsurance > previousInsurance) {
    const milestone = INSURANCE_MILESTONES.find(
      m => m.earned === currentInsurance
    );
    
    if (milestone) {
      createInsuranceToast(milestone.message);
    } else if (currentInsurance > previousInsurance) {
      // Generic insurance earned message
      createInsuranceToast(`🛡️ You earned streak insurance! Total: ${currentInsurance}`);
    }
  }
};

// Trigger confetti animation
const triggerConfetti = () => {
  // Create confetti particles
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const particles = 50;
  
  for (let i = 0; i < particles; i++) {
    createConfettiParticle(colors[Math.floor(Math.random() * colors.length)]);
  }
};

const createConfettiParticle = (color) => {
  const particle = document.createElement('div');
  particle.style.cssText = `
    position: fixed;
    top: -10px;
    left: ${Math.random() * 100}vw;
    width: 8px;
    height: 8px;
    background: ${color};
    pointer-events: none;
    z-index: 10000;
    animation: confetti-fall 3s linear forwards;
    transform: rotate(${Math.random() * 360}deg);
  `;
  
  document.body.appendChild(particle);
  
  setTimeout(() => {
    if (particle.parentNode) {
      particle.parentNode.removeChild(particle);
    }
  }, 3000);
};

// Add CSS animation if not already present
const addConfettiStyles = () => {
  if (!document.getElementById('confetti-styles')) {
    const style = document.createElement('style');
    style.id = 'confetti-styles';
    style.textContent = `
      @keyframes confetti-fall {
        to {
          transform: translateY(100vh) rotate(720deg);
        }
      }
      
      @keyframes animate-spin-slow {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      
      .animate-spin-slow {
        animation: animate-spin-slow 2s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }
};

// Initialize styles when module loads
addConfettiStyles();

// Comeback celebration
export const showComebackCelebration = (habitTitle, daysAway) => {
  toast.custom((t) => (
    <div
      className={`
        bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-2xl
        transform transition-all duration-300 ${t.visible ? 'scale-100' : 'scale-95 opacity-0'}
        border-4 border-white/20 max-w-sm
      `}
    >
      <div className="text-center">
        <div className="text-5xl mb-3">💪</div>
        <h3 className="text-lg font-bold mb-2">Welcome Back, Hero!</h3>
        <p className="text-white/90 text-sm mb-3">
          You're back to "{habitTitle}" after {daysAway} days. Every comeback is a victory!
        </p>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          Let's Do This! 🚀
        </button>
      </div>
    </div>
  ), {
    duration: 6000,
    position: 'top-center',
  });
};

// First habit completion celebration
export const showFirstCompletionCelebration = (habitTitle) => {
  toast.custom((t) => (
    <div
      className={`
        bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-2xl
        transform transition-all duration-300 ${t.visible ? 'animate-pulse' : 'opacity-0'}
        border-4 border-white/20 max-w-sm
      `}
    >
      <div className="text-center">
        <div className="text-5xl mb-3">🎉</div>
        <h3 className="text-lg font-bold mb-2">First Step Complete!</h3>
        <p className="text-white/90 text-sm mb-3">
          You just completed "{habitTitle}" for the first time. Every journey begins with a single step!
        </p>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          Amazing! ⭐
        </button>
      </div>
    </div>
  ), {
    duration: 5000,
    position: 'top-center',
  });
};

export default {
  checkStreakMilestones,
  checkInsuranceMilestones,
  showComebackCelebration,
  showFirstCompletionCelebration,
};