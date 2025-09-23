import React from 'react'
import { motion } from 'framer-motion'
import { useChat } from '../../contexts/ChatContext'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import TypingIndicator from './TypingIndicator'
import WelcomeScreen from './WelcomeScreen'

const ChatArea = () => {
  const { 
    currentConversation, 
    messages, 
    isTyping, 
    selectedBot,
    sendMessage 
  } = useChat()

  if (!currentConversation) {
    return <WelcomeScreen />
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Chat Header - Hidden on mobile since we have main header */}
      <div className="hidden lg:block p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{selectedBot?.avatar || '🤖'}</div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {currentConversation.title}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Online</span>
              <span>•</span>
              <span className="hidden sm:inline">Powered by {selectedBot?.model || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 pb-28 sm:pb-32 space-y-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">{selectedBot?.avatar || '🤖'}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {selectedBot ? `Start a conversation with ${selectedBot.name}` : 'Start a conversation'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {selectedBot?.description || 'Choose a bot to get started or create a new chat.'}
              </p>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => sendMessage("💡 Help me with a project")}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    💡 Ask for help with a project
                  </div>
                </button>
                <button 
                  onClick={() => sendMessage("🎯 I need specific advice")}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    🎯 Get specific advice
                  </div>
                </button>
                <button 
                  onClick={() => sendMessage("🚀 Let's brainstorm some ideas")}
                  className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    🚀 Brainstorm ideas
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <MessageBubble message={message} />
              </motion.div>
            ))}
            
            {isTyping && <TypingIndicator />}
          </>
        )}
      </div>

      {/* Message Input (sticky footer) */}
      <div className="sticky bottom-0 inset-x-0 z-10">
        <MessageInput onSendMessage={sendMessage} />
      </div>
    </div>
  )
}

export default ChatArea
