import React from 'react'
import { motion } from 'framer-motion'
import { useChat } from '../../contexts/ChatContext'

const TypingIndicator = () => {
  const { selectedBot } = useChat()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start"
    >
      <div className="flex items-center space-x-3">
        {/* Bot Avatar */}
        <div className="w-6 h-6 text-lg">{selectedBot.avatar}</div>
        
        {/* Typing Bubble */}
        <div className="glass px-4 py-3 rounded-2xl">
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">
              {selectedBot.name} is typing
            </span>
            <div className="flex space-x-1">
              <motion.div
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.1
                }}
              />
              <motion.div
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default TypingIndicator
