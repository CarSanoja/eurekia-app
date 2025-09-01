import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const InsuranceButton = ({ habit, onInsuranceUsed, compact = false }) => {
  const [isUsing, setIsUsing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user } = useAuth();

  const useInsurance = async () => {
    if (!habit.can_use_insurance || habit.insurance_available === 0) {
      toast.error('No insurance available');
      return;
    }

    setIsUsing(true);
    try {
      const response = await fetch(`/api/habits/${habit.id}/insurance/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('🛡️ Insurance used! Your streak is saved!');
        onInsuranceUsed?.(data);
        setShowConfirm(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to use insurance');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsUsing(false);
    }
  };

  if (compact) {
    return (
      <motion.button
        onClick={() => setShowConfirm(true)}
        disabled={!habit.can_use_insurance || habit.insurance_available === 0 || isUsing}
        className={`
          flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
          ${habit.can_use_insurance && habit.insurance_available > 0 
            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 active:scale-95' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
        whileTap={{ scale: 0.95 }}
      >
        🛡️ {habit.insurance_available || 0}
      </motion.button>
    );
  }

  return (
    <>
      <motion.button
        onClick={() => setShowConfirm(true)}
        disabled={!habit.can_use_insurance || habit.insurance_available === 0 || isUsing}
        className={`
          w-full p-4 rounded-xl border-2 border-dashed text-center transition-all
          ${habit.can_use_insurance && habit.insurance_available > 0
            ? 'border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100 hover:border-blue-400'
            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
          }
        `}
        whileHover={{ scale: habit.can_use_insurance ? 1.02 : 1 }}
        whileTap={{ scale: habit.can_use_insurance ? 0.98 : 1 }}
      >
        <div className="text-2xl mb-2">🛡️</div>
        <div className="font-bold mb-1">Use Streak Insurance</div>
        <div className="text-sm opacity-75">
          {habit.insurance_available > 0 
            ? `${habit.insurance_available} available`
            : 'No insurance available'
          }
        </div>
        {habit.insurance_available === 0 && (
          <div className="text-xs mt-2 opacity-60">
            Earn insurance by maintaining streaks (1 per 7 days)
          </div>
        )}
      </motion.button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Use Streak Insurance?
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  This will protect your {habit.current_streak}-day streak for today. 
                  You'll have {habit.insurance_available - 1} insurance left after this.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={useInsurance}
                    disabled={isUsing}
                    className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                    whileTap={{ scale: 0.95 }}
                  >
                    {isUsing ? 'Using...' : 'Use Insurance'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InsuranceButton;