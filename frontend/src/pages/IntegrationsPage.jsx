import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Settings, 
  BarChart3, 
  Check, 
  ExternalLink,
  Zap,
  MessageSquare,
  Mail,
  Globe,
  Smartphone,
  Phone,
  Bot,
  Link as LinkIcon
} from 'lucide-react'

const IntegrationsPage = () => {
  const [activeTab, setActiveTab] = useState('connected')

  const connectedIntegrations = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Connect with customers on WhatsApp',
      icon: '📱',
      status: 'connected',
      stats: {
        messages: 1247,
        lastSync: '2 min ago'
      },
      color: 'green'
    },
    {
      id: 'slack',
      name: 'Slack Workspace',
      description: 'Integrate with your team workspace',
      icon: '💬',
      status: 'connected',
      stats: {
        workspace: 'Tech Co',
        channels: 3
      },
      color: 'purple'
    }
  ]

  const availableIntegrations = [
    {
      id: 'telegram',
      name: 'Telegram Bot',
      description: 'Connect your Telegram bot to reach more users',
      icon: '🐦',
      status: 'available',
      category: 'messaging',
      color: 'blue'
    },
    {
      id: 'email',
      name: 'Email Support',
      description: 'Handle support emails with AI responses',
      icon: '📧',
      status: 'available',
      category: 'support',
      color: 'red'
    },
    {
      id: 'website',
      name: 'Website Widget',
      description: 'Add chat widget to your website',
      icon: '🌐',
      status: 'available',
      category: 'web',
      color: 'indigo'
    },
    {
      id: 'voice',
      name: 'Voice Calls',
      description: 'Handle voice calls with AI assistant',
      icon: '📞',
      status: 'available',
      category: 'voice',
      color: 'green'
    },
    {
      id: 'discord',
      name: 'Discord Bot',
      description: 'Integrate with Discord servers',
      icon: '💬',
      status: 'available',
      category: 'messaging',
      color: 'purple'
    },
    {
      id: 'ios',
      name: 'iOS App',
      description: 'Native iOS application integration',
      icon: '📱',
      status: 'available',
      category: 'mobile',
      color: 'gray'
    },
    {
      id: 'android',
      name: 'Android App',
      description: 'Native Android application integration',
      icon: '🤖',
      status: 'available',
      category: 'mobile',
      color: 'green'
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 5000+ apps via Zapier',
      icon: '🔗',
      status: 'available',
      category: 'automation',
      color: 'orange'
    },
    {
      id: 'analytics',
      name: 'Google Analytics',
      description: 'Track chat analytics and user behavior',
      icon: '📊',
      status: 'available',
      category: 'analytics',
      color: 'blue'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'setup':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getIcon = (iconName) => {
    const iconMap = {
      MessageSquare,
      Mail,
      Globe,
      Smartphone,
      Phone,
      Bot,
      LinkIcon,
      BarChart3
    }
    const IconComponent = iconMap[iconName] || MessageSquare
    return <IconComponent size={20} />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <span className="text-3xl mr-3">🔗</span>
                Integrations & Channels
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Connect your AI assistants with external platforms and services
              </p>
            </div>
            <button className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl">
              <Plus size={20} />
              <span>Add New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('connected')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'connected'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Connected ({connectedIntegrations.length})
              </button>
              <button
                onClick={() => setActiveTab('available')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'available'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Available ({availableIntegrations.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Connected Integrations */}
        {activeTab === 'connected' && (
          <div className="space-y-6">
            {connectedIntegrations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <LinkIcon size={48} className="mx-auto opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No integrations connected
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Connect your first integration to start reaching users on different platforms.
                </p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200"
                >
                  Browse Available Integrations
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {connectedIntegrations.map((integration, index) => (
                  <motion.div
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{integration.icon}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {integration.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-green-600 dark:text-green-400">
                              Connected
                            </span>
                          </div>
                        </div>
                      </div>
                      <IntegrationMenu />
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {integration.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {Object.entries(integration.stats).map(([key, value]) => (
                        <div key={key} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center justify-center space-x-2">
                        <Settings size={16} />
                        <span>Settings</span>
                      </button>
                      <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2">
                        <BarChart3 size={16} />
                        <span>Stats</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Available Integrations */}
        {activeTab === 'available' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableIntegrations.map((integration, index) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{integration.icon}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {integration.name}
                      </h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                        {integration.status === 'available' ? 'Available' : integration.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {integration.description}
                </p>

                {/* Category Badge */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full capitalize">
                    {integration.category}
                  </span>
                </div>

                {/* Connect Button */}
                <button className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2">
                  <LinkIcon size={16} />
                  <span>Connect Now</span>
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Integration Categories */}
        {activeTab === 'available' && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Integration Categories
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Messaging', icon: '💬', count: 3, color: 'blue' },
                { name: 'Mobile Apps', icon: '📱', count: 2, color: 'green' },
                { name: 'Web & Voice', icon: '🌐', count: 2, color: 'purple' },
                { name: 'Analytics', icon: '📊', count: 2, color: 'orange' }
              ].map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center"
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {category.count} integrations
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Integration Menu Component
const IntegrationMenu = () => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Settings size={16} className="text-gray-400" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
              <Settings size={14} />
              <span>Configure</span>
            </button>
            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
              <BarChart3 size={14} />
              <span>View Stats</span>
            </button>
            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
              <ExternalLink size={14} />
              <span>Test Connection</span>
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-red-600 dark:text-red-400">
              <span>Disconnect</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default IntegrationsPage
