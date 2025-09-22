import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Brain, 
  Shield, 
  CreditCard, 
  Code, 
  HelpCircle,
  Save,
  Bell,
  Moon,
  Sun,
  Globe,
  Volume2,
  Mic,
  MessageSquare
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { Link } from 'react-router-dom'

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)

  const [settings, setSettings] = useState({
    general: {
      theme: theme,
      language: 'English',
      timezone: 'UTC-5',
      dateFormat: 'MM/DD/YYYY'
    },
    chat: {
      defaultBot: 'technical',
      messageSound: true,
      typingIndicators: true,
      autoSaveChats: true,
      voiceInput: true,
      voiceOutput: true,
      voiceSpeed: 3,
      voiceType: 'female'
    },
    aiModels: {
      preferredModel: 'gpt-4',
      creativity: 3,
      responseLength: 'medium',
      contextMemory: true
    },
    privacy: {
      dataCollection: true,
      analytics: true,
      personalizedAds: false,
      shareUsageData: true
    }
  })

  const handleSave = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'aiModels', label: 'AI Models', icon: Brain },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api', label: 'API', icon: Code },
    { id: 'help', label: 'Help', icon: HelpCircle }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link
              to="/chat"
              className="h-10 px-3 inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Back to Chat"
            >
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Settings className="mr-3 text-primary-500" size={32} />
              Settings
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 mr-8">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <tab.icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">General Settings</h2>
                
                {/* Appearance */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Theme Preference
                      </label>
                      <div className="flex space-x-4">
                        {[
                          { id: 'light', label: 'Light Mode', icon: Sun },
                          { id: 'dark', label: 'Dark Mode', icon: Moon },
                          { id: 'system', label: 'System Default', icon: Globe }
                        ].map((option) => (
                          <label
                            key={option.id}
                            className={`flex-1 flex items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              theme === option.id
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="theme"
                              value={option.id}
                              checked={theme === option.id}
                              onChange={toggleTheme}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <option.icon className="mx-auto mb-2" size={24} />
                              <div className="text-sm font-medium">{option.label}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Experience */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Chat Experience</h3>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Default Bot
                        </label>
                        <select className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                          <option value="technical">Technical Assistant</option>
                          <option value="creative">Creative Writer</option>
                          <option value="business">Business Advisor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Language
                        </label>
                        <select className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                          <option value="english">English</option>
                          <option value="spanish">Spanish</option>
                          <option value="french">French</option>
                        </select>
                      </div>
                    </div>

                    {/* Toggle Settings */}
                    <div className="space-y-3">
                      {[
                        { key: 'messageSound', label: 'Message Sound', description: 'Play sound when receiving messages' },
                        { key: 'typingIndicators', label: 'Typing Indicators', description: 'Show when AI is typing' },
                        { key: 'autoSaveChats', label: 'Auto-save Chats', description: 'Automatically save conversation history' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{setting.label}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.chat[setting.key]}
                            onChange={(e) => setSettings({
                              ...settings,
                              chat: { ...settings.chat, [setting.key]: e.target.checked }
                            })}
                            className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save size={20} />
                    <span>{loading ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Other tabs would be implemented similarly */}
            {activeTab !== 'general' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <Settings size={48} className="mx-auto opacity-50" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {tabs.find(t => t.id === activeTab)?.label} Settings
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    This section is under development.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
