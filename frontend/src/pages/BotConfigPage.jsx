import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Zap, 
  Brain, 
  Settings,
  MessageSquare,
  BarChart3,
  Star
} from 'lucide-react'
import { useChat } from '../contexts/ChatContext'

const BotConfigPage = () => {
  const { id } = useParams()
  const { availableBots } = useChat()
  const [bot, setBot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testResponse, setTestResponse] = useState('')
  const [isTestingChat, setIsTestingChat] = useState(false)

  // Form state
  const [config, setConfig] = useState({
    name: '',
    description: '',
    avatar: '',
    model: 'GPT-4',
    personality: {
      tone: 'professional',
      creativity: 3,
      formality: 3
    },
    knowledgeBase: {
      programmingDocs: false,
      stackOverflow: true,
      githubRepos: true
    }
  })

  useEffect(() => {
    const foundBot = availableBots.find(b => b.id === id)
    if (foundBot) {
      setBot(foundBot)
      setConfig({
        name: foundBot.name,
        description: foundBot.description,
        avatar: foundBot.avatar,
        model: foundBot.model,
        personality: {
          tone: 'professional',
          creativity: 3,
          formality: 3
        },
        knowledgeBase: {
          programmingDocs: false,
          stackOverflow: true,
          githubRepos: true
        }
      })
    }
  }, [id, availableBots])

  const handleSave = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    // Show success message
  }

  const handleTestChat = async () => {
    if (!testMessage.trim()) return
    
    setIsTestingChat(true)
    // Simulate API call to test bot
    await new Promise(resolve => setTimeout(resolve, 1500))
    setTestResponse(`Hello! I'm your ${config.name}. ${testMessage.includes('code') ? 'I can help you with coding questions and technical solutions.' : 'How can I assist you today?'}`)
    setIsTestingChat(false)
  }

  const models = [
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model for complex tasks' },
    { id: 'codbert-base', name: 'CodeBERT-base', description: 'Specialized for programming tasks' },
    { id: 'microsoft-dialogpt', name: 'Microsoft DialoGPT', description: 'Optimized for conversations' },
    { id: 'bert-base', name: 'BERT-base', description: 'Good for understanding and analysis' }
  ]

  if (!bot) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bot Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The bot you're looking for doesn't exist.</p>
          <Link
            to="/bots"
            className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200"
          >
            Back to Bots
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/bots"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <span className="text-3xl mr-3">{bot.avatar}</span>
                  {bot.name} Configuration
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Customize your AI assistant's behavior and capabilities
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <Save size={20} />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Settings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Settings className="mr-3 text-primary-500" size={24} />
                Basic Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bot Name
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({...config, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Enter bot name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Avatar
                  </label>
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{config.avatar}</div>
                    <button className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2">
                      <Upload size={16} />
                      <span>Change</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig({...config, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                  placeholder="Describe what this bot specializes in..."
                />
              </div>
            </motion.div>

            {/* AI Model Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Brain className="mr-3 text-primary-500" size={24} />
                AI Model Selection
              </h2>
              
              <div className="grid gap-4">
                {models.map((model) => (
                  <label
                    key={model.id}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      config.model === model.name
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="model"
                      value={model.name}
                      checked={config.model === model.name}
                      onChange={(e) => setConfig({...config, model: e.target.value})}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{model.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{model.description}</div>
                    </div>
                    {config.model === model.name && (
                      <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Personality Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Zap className="mr-3 text-primary-500" size={24} />
                Personality
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tone
                  </label>
                  <select
                    value={config.personality.tone}
                    onChange={(e) => setConfig({
                      ...config,
                      personality: {...config.personality, tone: e.target.value}
                    })}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Creativity Level
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Conservative</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={config.personality.creativity}
                      onChange={(e) => setConfig({
                        ...config,
                        personality: {...config.personality, creativity: parseInt(e.target.value)}
                      })}
                      className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Creative</span>
                  </div>
                  <div className="flex justify-center mt-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-3 h-3 rounded-full ${
                            level <= config.personality.creativity
                              ? 'bg-primary-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Formality Level
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Casual</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={config.personality.formality}
                      onChange={(e) => setConfig({
                        ...config,
                        personality: {...config.personality, formality: parseInt(e.target.value)}
                      })}
                      className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Formal</span>
                  </div>
                  <div className="flex justify-center mt-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-3 h-3 rounded-full ${
                            level <= config.personality.formality
                              ? 'bg-primary-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Knowledge Base */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Knowledge Base
              </h2>
              
              <div className="space-y-4">
                {Object.entries(config.knowledgeBase).map(([key, value]) => (
                  <label key={key} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {key === 'programmingDocs' && 'Programming Documentation'}
                        {key === 'stackOverflow' && 'Stack Overflow'}
                        {key === 'githubRepos' && 'GitHub Repositories'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {key === 'programmingDocs' && 'Official language and framework docs'}
                        {key === 'stackOverflow' && 'Community Q&A and solutions'}
                        {key === 'githubRepos' && 'Open source code examples'}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setConfig({
                        ...config,
                        knowledgeBase: {...config.knowledgeBase, [key]: e.target.checked}
                      })}
                      className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                  </label>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Preview & Performance */}
          <div className="space-y-8">
            {/* Live Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <MessageSquare className="mr-2 text-primary-500" size={20} />
                Live Preview
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-2xl">{config.avatar}</div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{config.name}</div>
                      <div className="text-sm text-green-500 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                        Online
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Hi! I'm your {config.name}. How can I help you today?
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Test your bot..."
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleTestChat()}
                  />
                  <button
                    onClick={handleTestChat}
                    disabled={!testMessage.trim() || isTestingChat}
                    className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white py-2 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                  >
                    {isTestingChat ? 'Testing...' : 'Test Chat'}
                  </button>
                </div>

                {testResponse && (
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-white">{testResponse}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Performance Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="mr-2 text-primary-500" size={20} />
                Performance
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Response Time</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">1.2s avg</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Accuracy</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">94%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-[94%]"></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">User Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-500" size={16} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{bot.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BotConfigPage
