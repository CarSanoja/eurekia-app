import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Tooltip({ 
  children, 
  content, 
  position = 'top',
  delay = 0.5,
  className = '',
  arrow = true
}) {
  const [isVisible, setIsVisible] = useState(false)

  const positions = {
    top: {
      tooltip: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      arrow: 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900'
    },
    bottom: {
      tooltip: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      arrow: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900'
    },
    left: {
      tooltip: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      arrow: 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900'
    },
    right: {
      tooltip: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
      arrow: 'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900'
    }
  }

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ 
              duration: 0.2,
              delay: isVisible ? delay : 0 
            }}
            className={`absolute z-50 ${positions[position].tooltip}`}
          >
            <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 shadow-lg whitespace-nowrap max-w-xs">
              {content}
              {arrow && (
                <div className={`absolute ${positions[position].arrow}`} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}