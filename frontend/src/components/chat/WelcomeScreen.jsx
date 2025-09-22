import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Zap, Brain, Sparkles } from 'lucide-react'
import { useChat } from '../../contexts/ChatContext'

const WelcomeScreen = () => {
  const { availableBots, createConversation, setSelectedBot } = useChat()

  const handleQuickStart = (botId) => {
    const bot = availableBots.find(b => b.id === botId)
    if (bot) {
      setSelectedBot(bot)
      createConversation(`Chat with ${bot.name}`, botId)
    }
  }

  const features = [
    {
      icon: <Brain className="text-primary-500" size={24} />,
      title: "Multiple AI Models",
      description: "Switch between specialized AI models for different tasks"
    },
    {
      icon: <Zap className="text-yellow-500" size={24} />,
      title: "Lightning Fast",
      description: "Get responses in seconds with optimized performance"
    },
    {
      icon: <Sparkles className="text-purple-500" size={24} />,
      title: "Smart Context",
      description: "AI remembers your conversation history and preferences"
    }
  ]

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
      {/* Floating Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-blob"></div>
        <div className="floating-blob"></div>
        <div className="floating-blob"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="text-white" size={40} />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to{' '}
            <span className="gradient-text">AbhiBot</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose an AI assistant to start your conversation. Each bot is specialized for different tasks and powered by cutting-edge models.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <div key={index} className="glass rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Bot Selection */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Choose Your AI Assistant
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableBots.map((bot, index) => (
              <motion.button
                key={bot.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                onClick={() => handleQuickStart(bot.id)}
                className="glass rounded-2xl p-6 text-left hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-3xl">{bot.avatar}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {bot.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${bot.online ? 'bg-green-500' : 'bg-gray-400'}`} />
                      <span className="text-gray-500 dark:text-gray-400">
                        {bot.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {bot.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>⭐ {bot.rating}</span>
                  <span>{bot.chats} chats</span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                    {bot.model}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Or try these popular prompts:
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => handleQuickStart('technical')}
              className="glass rounded-xl p-4 text-left hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">💻</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    "Help me debug this code"
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Technical Assistant
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => handleQuickStart('creative')}
              className="glass rounded-xl p-4 text-left hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">✍️</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    "Write a creative story"
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Creative Writer
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => handleQuickStart('business')}
              className="glass rounded-xl p-4 text-left hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">💼</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    "Analyze market trends"
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Business Advisor
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => handleQuickStart('education')}
              className="glass rounded-xl p-4 text-left hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🎓</div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                    "Explain quantum physics"
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Education Tutor
                  </div>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default WelcomeScreen
