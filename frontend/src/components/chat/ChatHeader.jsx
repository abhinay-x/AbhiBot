import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Menu, 
  Settings, 
  Mic, 
  MicOff, 
  Sun, 
  Moon, 
  ChevronDown,
  User,
  LogOut,
  BarChart3,
  MoreVertical,
  UserCircle,
  Palette,
  Bell,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Link } from 'react-router-dom'

const ChatHeader = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  rightPanelOpen, 
  setRightPanelOpen,
  selectedBot,
  onBotSelect 
}) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(false)

  return (
    <header className="relative h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Menu size={20} className="text-gray-600 dark:text-gray-300" />
        </button>

        {/* Keep header minimal: no brand and no selected bot in navbar */}

        {/* Model Badge (hidden per request: keep header minimal with just title) */}
        <div className="hidden"></div>
      </div>

      {/* Center Brand (like ChatGPT) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-sm">
            <span className="text-white">🤖</span>
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">AbhiBot</span>
        </div>
      </div>

      {/* Right Section Desktop (hidden as per request) */}
      <div className="hidden">
        {/* Voice Toggle */}
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`p-2 rounded-lg transition-all duration-200 ${
            voiceEnabled
              ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
          title={voiceEnabled ? 'Voice: ON' : 'Voice: OFF'}
        >
          {voiceEnabled ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? 
            <Sun size={18} className="text-yellow-500" /> : 
            <Moon size={18} className="text-gray-600" />
          }
        </button>

        {/* Analytics Link */}
        <Link
          to="/analytics"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Analytics"
        >
          <BarChart3 size={18} className="text-gray-600 dark:text-gray-300" />
        </Link>

        {/* Right Panel Toggle */}
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className={`p-2 rounded-lg transition-colors ${
            rightPanelOpen
              ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
          title="Bot settings"
        >
          <Settings size={18} />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50"
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User size={16} />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings size={16} />
                  <span>Preferences</span>
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    logout()
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Actions menu (now used on all screen sizes) */}
      <div className="flex items-center">
        <button
          onClick={() => setShowActionsMenu(!showActionsMenu)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Open actions menu"
        >
          <MoreVertical size={18} className="text-gray-600 dark:text-gray-300" />
        </button>

        {showActionsMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-2 top-14 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-xl shadow-2xl py-2 z-50"
          >
            {/* Quick Actions Section */}
            <div className="px-3 py-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Quick Actions
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => { setVoiceEnabled(!voiceEnabled); setShowActionsMenu(false) }}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                    voiceEnabled 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Toggle Voice"
                >
                  {voiceEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                  <span className="text-xs mt-1">Voice</span>
                </button>
                
                <button
                  onClick={() => { toggleTheme(); setShowActionsMenu(false) }}
                  className="flex flex-col items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  <span className="text-xs mt-1">Theme</span>
                </button>

                <Link
                  to="/analytics"
                  onClick={() => setShowActionsMenu(false)}
                  className="flex flex-col items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  title="Analytics"
                >
                  <BarChart3 size={18} />
                  <span className="text-xs mt-1">Stats</span>
                </Link>

                <button
                  onClick={() => { setRightPanelOpen(!rightPanelOpen); setShowActionsMenu(false) }}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                    rightPanelOpen 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  title="Bot Settings"
                >
                  <Settings size={18} />
                  <span className="text-xs mt-1">Settings</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {/* Menu Items */}
            <div className="px-2">
              <button
                onClick={() => { onBotSelect?.(); setShowActionsMenu(false) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center space-x-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-500/20 to-purple-500/20 flex items-center justify-center">
                  <ChevronDown size={16} className="text-primary-600" />
                </div>
                <span>Select Bot</span>
              </button>

              <Link
                to="/settings"
                onClick={() => setShowActionsMenu(false)}
                className="flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-500/20 to-slate-500/20 flex items-center justify-center">
                  <Palette size={16} className="text-gray-600" />
                </div>
                <span>Preferences</span>
              </Link>

              <Link
                to="/notifications"
                onClick={() => setShowActionsMenu(false)}
                className="flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Bell size={16} className="text-blue-600" />
                </div>
                <span>Notifications</span>
              </Link>

              <Link
                to="/help"
                onClick={() => setShowActionsMenu(false)}
                className="flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                  <HelpCircle size={16} className="text-yellow-600" />
                </div>
                <span>Help & Support</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {/* Account Section */}
            <div className="px-2">
              <button
                onClick={() => { setShowActionsMenu(false); setShowUserMenu(true) }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    View Profile
                  </div>
                </div>
              </button>

              <button
                onClick={() => { setShowActionsMenu(false); logout() }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center space-x-3 mt-1"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500/20 to-pink-500/20 flex items-center justify-center">
                  <LogOut size={16} className="text-red-600" />
                </div>
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {(showUserMenu || showActionsMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowUserMenu(false); setShowActionsMenu(false) }}
        />
      )}
    </header>
  )
}

export default ChatHeader
