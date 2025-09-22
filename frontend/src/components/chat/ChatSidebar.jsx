import React from 'react'
import { motion } from 'framer-motion'
import { Search, Plus } from 'lucide-react'

const ChatSidebar = ({ 
  conversations, 
  currentConversation, 
  onSelectConversation, 
  onNewChat,
  searchQuery,
  setSearchQuery 
}) => {
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversations
          </h2>
        </div>
        
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Plus size={16} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No conversations yet. Start a new chat to begin!
            </p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 mb-2 ${
                  currentConversation?.id === conversation.id
                    ? 'bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-200 dark:border-primary-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-lg mt-1">
                    {conversation.botAvatar || '🤖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {conversation.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {new Date(conversation.timestamp).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {conversation.messageCount || 0} messages
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatSidebar
