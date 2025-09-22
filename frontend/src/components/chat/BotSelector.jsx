import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Star, Zap, Clock } from 'lucide-react'
import { useChat } from '../../contexts/ChatContext'

const BotSelector = ({ isOpen, onClose, bots, selectedBot }) => {
  const { availableBots, loadBots, setSelectedBot, createConversation } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Ensure bots are available when the modal opens
  useEffect(() => {
    if (isOpen && (!bots || bots.length === 0) && (!availableBots || availableBots.length === 0)) {
      loadBots()
    }
  }, [isOpen])

  // Choose the best available source for bots
  const sourceBots = (bots && bots.length) ? bots : (availableBots || [])

  const categories = [
    { id: 'all', name: 'All Bots', count: sourceBots.length },
    { id: 'technical', name: 'Technical', count: sourceBots.filter(b => b.category === 'technical').length },
    { id: 'creative', name: 'Creative', count: sourceBots.filter(b => b.category === 'creative').length },
    { id: 'business', name: 'Business', count: sourceBots.filter(b => b.category === 'business').length },
    { id: 'education', name: 'Education', count: sourceBots.filter(b => b.category === 'education').length },
    { id: 'health', name: 'Health', count: sourceBots.filter(b => b.category === 'health').length }
  ]

  const filteredBots = sourceBots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bot.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || bot.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSelectBot = async (bot) => {
    try {
      setSelectedBot(bot)
      // Ensure a conversation is ready so the input shows immediately
      await createConversation(`Chat with ${bot.name}`, bot.id)
    } catch (e) {
      // no-op; fallback is still to switch bot
      console.error('Failed to start conversation for selected bot', e)
    } finally {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl mx-4 sm:mx-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Choose AI Assistant
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Select the perfect AI for your task
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={24} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search bots by name or capability..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* Bots Grid */}
          <div className="p-6 overflow-y-auto flex-1">
            {filteredBots.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <Search size={48} className="mx-auto opacity-50" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No bots found matching your search criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBots.map((bot) => (
                  <motion.button
                    key={bot.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectBot(bot)}
                    className={`p-4 rounded-xl text-left transition-all duration-200 flex flex-col ${
                      (selectedBot?.id === bot.id)
                        ? 'bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-2 border-primary-200 dark:border-primary-800'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent'
                    }`}
                  >
                    {/* Bot Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">{bot.avatar}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {bot.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${bot.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-gray-500 dark:text-gray-400">
                            {bot.online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                      {selectedBot?.id === bot.id && (
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {bot.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star size={12} />
                          <span>{bot.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                          <Zap size={12} />
                          <span>{bot.chats}</span>
                        </div>
                      </div>
                      <div className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-gray-700 dark:text-gray-300">
                        {bot.model}
                      </div>
                    </div>

                    {/* Performance Indicator */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Response Time</span>
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>~1.2s</span>
                        </div>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                        <div className="bg-green-500 h-1 rounded-full w-4/5"></div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {filteredBots.length} bot{filteredBots.length !== 1 ? 's' : ''} available
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                  disabled={!selectedBot}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedBot
                      ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:from-primary-600 hover:to-purple-700'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {selectedBot ? `Continue with ${selectedBot.name}` : 'Select a bot to continue'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default BotSelector
