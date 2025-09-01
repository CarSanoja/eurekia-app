import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BadgeDisplay from './BadgeDisplay'
import BadgeModal from './BadgeModal'

export default function BadgeCollection({ badges = [], showAll = false }) {
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleBadgeClick = (badge) => {
    setSelectedBadge(badge)
    setShowModal(true)
  }

  const displayBadges = showAll ? badges : badges.slice(0, 6)
  const hasMoreBadges = !showAll && badges.length > 6

  if (badges.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 text-center">
        <div className="text-6xl mb-4 opacity-50">🏆</div>
        <h3 className="text-lg font-bold text-gray-600 mb-2">No Badges Yet</h3>
        <p className="text-gray-500 text-sm">
          Complete habits and reach milestones to earn your first badge! 🚀
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center opacity-50">
            <span className="text-2xl">🏗️</span>
          </div>
          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center opacity-50">
            <span className="text-2xl">🔥</span>
          </div>
          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center opacity-50">
            <span className="text-2xl">👑</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Your future badges await...</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🏆 Badge Collection
            <span className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {badges.length}
            </span>
          </h2>
          {hasMoreBadges && (
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              View All ({badges.length})
            </button>
          )}
        </div>

        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <AnimatePresence>
            {displayBadges.map((badge, index) => (
              <motion.div
                key={badge.id || `${badge.type}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1 }}
              >
                <BadgeDisplay
                  badge={badge}
                  onClick={() => handleBadgeClick(badge)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {hasMoreBadges && (
          <div className="text-center pt-4">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg">
              Show All Badges ({badges.length})
            </button>
          </div>
        )}
      </div>

      <BadgeModal
        badge={selectedBadge}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}