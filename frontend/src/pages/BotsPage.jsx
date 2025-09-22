import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Settings, 
  Play, 
  Pause, 
  Star, 
  MessageSquare,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  Copy
} from 'lucide-react'
import { useChat } from '../contexts/ChatContext'

const BotsPage = () => {
  const { availableBots, loadBots } = useChat()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // all, active, inactive
  const [sortBy, setSortBy] = useState('rating') // rating, chats, name

  // Ensure bots are loaded when visiting this page directly
  useEffect(() => {
    if (!availableBots || availableBots.length === 0) {
      loadBots()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredBots = (availableBots || [])
    .filter(bot => {
      const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           bot.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && bot.online) ||
                           (filterStatus === 'inactive' && !bot.online)
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating
        case 'chats':
          return b.chats - a.chats
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

  const activeBots = availableBots.filter(bot => bot.online)
  const totalChats = availableBots.reduce((sum, bot) => sum + bot.chats, 0)
  const avgRating = availableBots.reduce((sum, bot) => sum + bot.rating, 0) / availableBots.length

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
                  <span className="text-3xl mr-3">🤖</span>
                  Bot Management
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Manage your AI assistants and their configurations
                </p>
              </div>
            </div>
            <button className="self-start md:self-auto bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl">
              <Plus size={20} />
              <span>Create New Bot</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bots</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{availableBots.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              ↗️ +2 this month
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Bots</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeBots.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Play className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {((activeBots.length / availableBots.length) * 100).toFixed(0)}% online
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Chats</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalChats.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              ↗️ +23% this week
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgRating.toFixed(1)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Star className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>
            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
              ↗️ +0.3 improvement
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="rating">Sort by Rating</option>
                <option value="chats">Sort by Chats</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBots.map((bot, index) => (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
            >
              {/* Bot Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{bot.avatar}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {bot.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${bot.online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                      <span className={`${bot.online ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {bot.online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                <BotMenu bot={bot} />
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {bot.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{bot.chats}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">chats</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center justify-center">
                    <Star className="text-yellow-500 mr-1" size={16} />
                    {bot.rating}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">rating</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">1.2s</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">avg response</div>
                </div>
              </div>

              {/* Model Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                  {bot.model}
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Link
                  to={`/bots/config/${bot.id}`}
                  className="flex-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-center"
                >
                  Edit
                </Link>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  📊
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBots.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <MessageSquare size={48} className="mx-auto opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No bots found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Try adjusting your search or filter criteria.
            </p>
            <button className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200">
              Create Your First Bot
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Bot Menu Component
const BotMenu = ({ bot }) => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <MoreVertical size={16} className="text-gray-400" />
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1 min-w-[140px]">
            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
              <Edit3 size={14} />
              <span>Edit</span>
            </button>
            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
              <Copy size={14} />
              <span>Duplicate</span>
            </button>
            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2">
              {bot.online ? <Pause size={14} /> : <Play size={14} />}
              <span>{bot.online ? 'Pause' : 'Start'}</span>
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-red-600 dark:text-red-400">
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default BotsPage
