import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, CheckCircle2, Settings, Mail, MessageSquare, AlertCircle } from 'lucide-react'

const NotificationsPage = () => {
  const channels = [
    { key: 'in_app', label: 'In‑app alerts', icon: MessageSquare, enabled: true, description: 'Show notifications inside the app.' },
    { key: 'email', label: 'Email updates', icon: Mail, enabled: false, description: 'Send important updates to your email.' },
  ]

  const recent = [
    { id: 1, title: 'New message from Customer Support Assistant', time: '2 min ago', type: 'info' },
    { id: 2, title: 'Analytics updated for this week', time: '1 hr ago', type: 'success' },
    { id: 3, title: 'Model switched to mistral-7b', time: 'Yesterday', type: 'info' },
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
              <Bell className="mr-3 text-primary-500" size={32} />
              Notifications
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage how you receive alerts and view recent notifications.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-6">
        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center mb-4">
            <Settings className="text-primary-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preferences</h2>
          </div>
          <div className="space-y-3">
            {channels.map((c) => (
              <label key={c.key} className="flex items-start justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <c.icon className="text-gray-500" size={18} />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{c.label}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{c.description}</div>
                  </div>
                </div>
                <input type="checkbox" defaultChecked={c.enabled} className="mt-1 w-5 h-5" />
              </label>
            ))}
          </div>
        </motion.div>

        {/* Recent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center mb-4">
            <CheckCircle2 className="text-green-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recent.map((n) => (
              <div key={n.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${n.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <div className="text-gray-900 dark:text-white">{n.title}</div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{n.time}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 inline-flex items-center">
            <AlertCircle size={16} className="mr-2" /> Only a subset is shown here.
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default NotificationsPage
