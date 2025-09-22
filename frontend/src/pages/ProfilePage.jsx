import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Save, 
  Bell, 
  Moon, 
  Sun, 
  Globe, 
  Clock,
  CreditCard,
  BarChart3,
  MessageSquare,
  Star,
  Calendar
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Link } from 'react-router-dom'

const ProfilePage = () => {
  const { user, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    timezone: 'UTC-5',
    language: 'English'
  })

  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    pushNotifications: true,
    smsUpdates: false,
    theme: theme,
    language: 'English',
    timezone: 'UTC-5'
  })

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      await updateUser(profileData)
      // Show success message
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
  }

  const stats = {
    totalConversations: 2847,
    favoriteBot: 'Technical Assistant',
    avgSession: '12 minutes',
    memberSince: 'January 2024'
  }

  const usageData = [
    { bot: 'Technical Assistant', sessions: 156, percentage: 45 },
    { bot: 'Creative Writer', sessions: 89, percentage: 26 },
    { bot: 'Business Advisor', sessions: 67, percentage: 19 },
    { bot: 'Education Tutor', sessions: 34, percentage: 10 }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start space-x-3">
              <Link
                to="/chat"
                className="h-10 px-3 inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Back to Chat"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <User className="mr-3 text-primary-500" size={32} />
                  Profile Settings
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                    <Camera size={16} className="text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-3">
                  {user?.name || 'User'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {user?.email}
                </p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Personal Info', icon: User },
                  { id: 'preferences', label: 'Preferences', icon: Bell },
                  { id: 'usage', label: 'Usage Statistics', icon: BarChart3 },
                  { id: 'billing', label: 'Billing', icon: CreditCard }
                ].map((tab) => (
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
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Personal Info Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Personal Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <select
                        value={profileData.language}
                        onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <select
                        value={profileData.timezone}
                        onChange={(e) => setProfileData({...profileData, timezone: e.target.value})}
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      >
                        <option value="UTC-8">Pacific Time (UTC-8)</option>
                        <option value="UTC-7">Mountain Time (UTC-7)</option>
                        <option value="UTC-6">Central Time (UTC-6)</option>
                        <option value="UTC-5">Eastern Time (UTC-5)</option>
                        <option value="UTC+0">GMT (UTC+0)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save size={20} />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Appearance */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Appearance
                  </h2>
                  
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
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="theme"
                              value={option.id}
                              checked={theme === option.id}
                              onChange={() => {
                                if (option.id === 'system') {
                                  // Handle system theme
                                } else {
                                  toggleTheme()
                                }
                              }}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <option.icon className="mx-auto mb-2 text-gray-600 dark:text-gray-300" size={24} />
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {option.label}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Notifications
                  </h2>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'emailAlerts', label: 'Email Alerts', description: 'Receive email notifications for important updates' },
                      { key: 'pushNotifications', label: 'Push Notifications', description: 'Get real-time notifications in your browser' },
                      { key: 'smsUpdates', label: 'SMS Updates', description: 'Receive text messages for critical alerts' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {setting.label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {setting.description}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences[setting.key]}
                          onChange={(e) => setPreferences({
                            ...preferences,
                            [setting.key]: e.target.checked
                          })}
                          className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSavePreferences}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Save size={20} />
                    <span>{loading ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Usage Statistics Tab */}
            {activeTab === 'usage' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Stats Overview */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Conversations</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalConversations.toLocaleString()}</p>
                      </div>
                      <MessageSquare className="text-blue-500" size={24} />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favorite Bot</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">💻 {stats.favoriteBot}</p>
                      </div>
                      <Star className="text-yellow-500" size={24} />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Session</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgSession}</p>
                      </div>
                      <Clock className="text-green-500" size={24} />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Since</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.memberSince}</p>
                      </div>
                      <Calendar className="text-purple-500" size={24} />
                    </div>
                  </div>
                </div>

                {/* Bot Usage */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                    Bot Usage Breakdown
                  </h3>
                  <div className="space-y-4">
                    {usageData.map((bot, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                          <span className="font-medium text-gray-900 dark:text-white">{bot.bot}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-primary-500 h-2 rounded-full" 
                              style={{ width: `${bot.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300 w-16 text-right">
                            {bot.sessions} sessions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Account Information
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Current Plan
                    </h3>
                    <div className="p-4 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 dark:text-white">Pro Plan</span>
                        <span className="text-primary-600 dark:text-primary-400 font-bold">$29/month</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        Usage: 2,847/5,000 messages
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                        <div className="bg-primary-500 h-2 rounded-full w-[57%]"></div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        57% of monthly limit used
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Billing Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Billing Cycle:</span>
                        <span className="font-medium text-gray-900 dark:text-white">Monthly</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Next Billing:</span>
                        <span className="font-medium text-gray-900 dark:text-white">Dec 15, 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Payment Method:</span>
                        <span className="font-medium text-gray-900 dark:text-white">•••• 4242</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-lg font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors flex items-center justify-center space-x-2">
                      <CreditCard size={16} />
                      <span>Manage Billing</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
