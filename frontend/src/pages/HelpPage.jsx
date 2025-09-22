import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HelpCircle, BookOpen, Mail, LifeBuoy, MessageSquare, Settings } from 'lucide-react'

const HelpPage = () => {
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
              <HelpCircle className="mr-3 text-primary-500" size={32} />
              Help & Support
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Find answers, learn how to use features, and get in touch if you need help.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* FAQ / Guides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center mb-4">
              <BookOpen className="text-primary-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Guides</h2>
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/analytics" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Understanding the Analytics Dashboard
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Configure Preferences and Theme
                </Link>
              </li>
              <li>
                <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Manage Bots and Models (coming soon)
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Troubleshooting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center mb-4">
              <LifeBuoy className="text-green-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Troubleshooting</h2>
            </div>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p>• Messages appear twice — make sure WebSocket is connected; we avoid optimistic UI when socket is live.</p>
              <p>• 401 errors — check you are logged in and the Authorization header is attached.</p>
              <p>• TTS not speaking — click on the page first, then tap the speaker icon; some browsers require a gesture.</p>
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center mb-4">
              <Mail className="text-purple-500 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact</h2>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3">
              <p>Have a question or found a bug? Reach out to us:</p>
              <p>Email: <a href="mailto:support@example.com" className="text-primary-600 dark:text-primary-400 hover:underline">support@example.com</a></p>
              <p>Community: <a href="#" className="text-primary-600 dark:text-primary-400 hover:underline">Join our Discord (coming soon)</a></p>
            </div>
          </motion.div>
        </div>

        {/* Shortcuts / Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center mb-4">
            <MessageSquare className="text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tips</h2>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700 dark:text-gray-300">
            <li>• Press Enter to send, Shift+Enter for a new line.</li>
            <li>• Use the Bot Types list to quickly start a chat with a specialized assistant.</li>
            <li>• Toggle the right panel to inspect model and quick actions.</li>
            <li>• Use the sidebar search to find conversations fast.</li>
          </ul>
        </motion.div>

        {/* Links */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link to="/settings" className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">
            <Settings size={16} className="mr-2" /> Preferences
          </Link>
          <Link to="/chat" className="inline-flex items-center px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30">
            ← Back to Chat
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HelpPage
