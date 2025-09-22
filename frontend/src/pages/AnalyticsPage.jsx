import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  Star,
  Users,
  Zap,
  Calendar,
  Download,
  Filter
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30') // 7, 30, 90 days

  // Mock data
  const conversationData = [
    { date: '2024-01-01', conversations: 45, messages: 234 },
    { date: '2024-01-02', conversations: 52, messages: 287 },
    { date: '2024-01-03', conversations: 38, messages: 198 },
    { date: '2024-01-04', conversations: 67, messages: 345 },
    { date: '2024-01-05', conversations: 73, messages: 412 },
    { date: '2024-01-06', conversations: 59, messages: 321 },
    { date: '2024-01-07', conversations: 81, messages: 456 }
  ]

  const botUsageData = [
    { name: 'Technical', value: 35, color: '#8B5CF6' },
    { name: 'Creative', value: 25, color: '#06B6D4' },
    { name: 'Business', value: 20, color: '#10B981' },
    { name: 'Educational', value: 15, color: '#F59E0B' },
    { name: 'Health', value: 5, color: '#EF4444' }
  ]

  const satisfactionData = [
    { date: '2024-01-01', rating: 4.2 },
    { date: '2024-01-02', rating: 4.3 },
    { date: '2024-01-03', rating: 4.1 },
    { date: '2024-01-04', rating: 4.5 },
    { date: '2024-01-05', rating: 4.6 },
    { date: '2024-01-06', rating: 4.4 },
    { date: '2024-01-07', rating: 4.7 }
  ]

  const recentActivity = [
    { id: 1, user: 'User123', action: 'started chat with Tech Bot', time: '2 min ago', status: 'active' },
    { id: 2, user: 'User456', action: 'rated 5⭐', time: '5 min ago', status: 'completed' },
    { id: 3, user: 'User789', action: 'Bot response: 0.8s', time: '8 min ago', status: 'performance' },
    { id: 4, user: 'User321', action: 'completed conversation', time: '12 min ago', status: 'completed' },
    { id: 5, user: 'User654', action: 'started chat with Creative Bot', time: '15 min ago', status: 'active' }
  ]

  const stats = {
    totalChats: 2847,
    avgResponseTime: 1.2,
    satisfaction: 4.7,
    topBot: 'Technical Assistant'
  }

  const getActivityIcon = (status) => {
    switch (status) {
      case 'active':
        return <MessageSquare size={16} className="text-blue-500" />
      case 'completed':
        return <Star size={16} className="text-green-500" />
      case 'performance':
        return <Zap size={16} className="text-yellow-500" />
      default:
        return <Clock size={16} className="text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start space-x-4">
              <Link
                to="/chat"
                className="h-10 px-3 inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Back to Chat"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <BarChart3 className="mr-3 text-primary-500" size={32} />
                  Analytics Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Track performance and user engagement across all AI assistants
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
              <button className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2">
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Chats</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalChats.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                  <TrendingUp size={16} className="mr-1" />
                  <span>↗️ +23%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgResponseTime}s</p>
                <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                  <Zap size={16} className="mr-1" />
                  <span>⚡Fast</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Clock className="text-green-600 dark:text-green-400" size={24} />
              </div>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Satisfaction</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Star className="text-yellow-500 mr-2" size={24} />
                  {stats.satisfaction}
                </p>
                <div className="flex items-center mt-2 text-sm text-green-600 dark:text-green-400">
                  <TrendingUp size={16} className="mr-1" />
                  <span>📈 +0.3</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Star className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Bot</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">💻 Tech</p>
                <div className="flex items-center mt-2 text-sm text-blue-600 dark:text-blue-400">
                  <Users size={16} className="mr-1" />
                  <span>68% use</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Users className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Conversations Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Conversations Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={conversationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="conversations" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bot Usage Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Bot Usage Distribution
            </h3>
            <div className="flex items-center justify-between">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={botUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {botUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {botUsageData.map((bot, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: bot.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {bot.name}: {bot.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Satisfaction Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              User Satisfaction Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={satisfactionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis domain={[3.5, 5]} stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Recent Activity Feed
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">
              View all activity →
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
