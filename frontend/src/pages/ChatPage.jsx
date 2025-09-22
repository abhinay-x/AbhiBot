import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Settings, 
  LogOut, 
  Search,
  Plus,
  MoreVertical,
  Trash2,
  Edit3,
  BarChart3,
  Sun,
  Moon,
  User
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import { useTheme } from '../contexts/ThemeContext'
import ChatHeader from '../components/chat/ChatHeader'
import ChatSidebar from '../components/chat/ChatSidebar'
import ChatArea from '../components/chat/ChatArea'
import BotSelector from '../components/chat/BotSelector'

const ChatPage = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { 
    conversations, 
    currentConversation, 
    selectedBot, 
    availableBots,
    messages,
    loadBots,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation
  } = useChat()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [showBotSelector, setShowBotSelector] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group conversations by date
  const groupConversationsByDate = (conversations) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    }

    conversations.forEach(conv => {
      const convDate = new Date(conv.timestamp)
      if (convDate.toDateString() === today.toDateString()) {
        groups.today.push(conv)
      } else if (convDate.toDateString() === yesterday.toDateString()) {
        groups.yesterday.push(conv)
      } else if (convDate > lastWeek) {
        groups.thisWeek.push(conv)
      } else {
        groups.older.push(conv)
      }
    })

    return groups
  }

  const conversationGroups = groupConversationsByDate(filteredConversations)

  // Ensure models list is available for selectors
  useEffect(() => {
    if (!availableBots || availableBots.length === 0) {
      loadBots()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close sidebar and right panel by default on small screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false)
      setRightPanelOpen(false)
    }
  }, [])

  // Responsively toggle sidebar on viewport changes
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        // Desktop: keep sidebar open
        setSidebarOpen(true)
      } else {
        // Mobile: hide sidebar; also hide right panel for space
        setSidebarOpen(false)
        setRightPanelOpen(false)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Ensure users land directly in a chat input view
  useEffect(() => {
    if (!currentConversation) {
      if (conversations && conversations.length > 0) {
        selectConversation(conversations[0])
      } else if (availableBots && availableBots.length > 0) {
        createConversation(`Chat with ${availableBots[0].name}`, availableBots[0].id)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentConversation, conversations, availableBots])

  const handleNewChat = () => {
    const bot = selectedBot || availableBots[0]
    if (!bot) return
    createConversation(`Chat with ${bot.name}`, bot.id)
  }

  // Export helpers
  const buildTranscriptMarkdown = () => {
    const convTitle = currentConversation?.title || 'Conversation'
    const lines = [`# ${convTitle}`, '', `Date: ${new Date().toLocaleString()}`, '']
    const msgs = (currentConversation?.id ? (messages || []) : [])
    for (const m of msgs) {
      const who = m.sender?.type === 'user' ? 'You' : (selectedBot?.name || 'Bot')
      const time = m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ''
      const text = String(m.content?.text || m.content || '').replace(/\s+$/,'')
      lines.push(`**${who}** ${time}`, '', text, '')
    }
    return lines.join('\n')
  }

  const handleSaveChatPDF = () => {
    try {
      const htmlParts = []
      const title = currentConversation?.title || 'Conversation'
      htmlParts.push(`<html><head><title>${title}</title>`)
      htmlParts.push('<meta charset="utf-8"/>')
      htmlParts.push('<style>body{font-family:Arial,system-ui,Segoe UI,Tahoma,sans-serif;padding:24px;color:#111} .msg{margin:12px 0;padding:12px;border-radius:12px;border:1px solid #e5e7eb} .u{background:#f8fafc} .b{background:#f3f4f6} h1{margin:0 0 8px;font-size:22px} .meta{color:#6b7280;font-size:12px;margin-bottom:16px}</style>')
      htmlParts.push('</head><body>')
      htmlParts.push(`<h1>${title}</h1>`) 
      htmlParts.push(`<div class="meta">Exported ${new Date().toLocaleString()}</div>`)
      const msgs = messages || []
      for (const m of msgs) {
        const who = m.sender?.type === 'user' ? 'You' : (selectedBot?.name || 'Bot')
        const time = m.createdAt ? new Date(m.createdAt).toLocaleString() : ''
        const text = (String(m.content?.text || m.content || '') || '').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br/>')
        htmlParts.push(`<div class="msg ${m.sender?.type === 'user' ? 'u' : 'b'}"><div class="meta"><strong>${who}</strong> · ${time}</div><div>${text}</div></div>`)
      }
      htmlParts.push('</body></html>')
      const w = window.open('', '_blank')
      if (w) {
        w.document.open()
        w.document.write(htmlParts.join(''))
        w.document.close()
        w.focus()
        // Let the DOM paint then invoke print (user can choose Save as PDF)
        setTimeout(() => { try { w.print() } catch {} }, 250)
      }
    } catch (e) {
      console.error('Export to PDF failed', e)
      alert('Unable to export PDF in this browser. You can try the browser\'s Print to PDF.')
    }
  }

  const handleExportShare = async () => {
    try {
      const md = buildTranscriptMarkdown()
      // Try Web Share API first
      if (navigator.share) {
        try {
          await navigator.share({ title: currentConversation?.title || 'Chat Transcript', text: md })
          return
        } catch {}
      }
      // Fallback: copy to clipboard and download .txt snapshot
      await navigator.clipboard?.writeText(md)
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(currentConversation?.title || 'chat').replace(/[^a-z0-9-_]+/gi,'_')}.md`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      alert('Transcript copied to clipboard and downloaded as .md. You can upload it anywhere to share publicly.')
    } catch (e) {
      console.error('Share export failed', e)
      alert('Could not share automatically. The transcript will be downloaded instead.')
    }
  }

  const handleDeleteConversation = (convId, e) => {
    e.stopPropagation()
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(convId)
    }
  }

  const handleRenameConversation = async (conv, e) => {
    e.stopPropagation()
    const current = conv.title || ''
    const next = window.prompt('Rename conversation:', current)
    if (next && next.trim() && next.trim() !== current) {
      await renameConversation(conv.id, next.trim())
    }
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3 }}
            className="fixed lg:relative inset-y-0 left-0 z-50 w-80 lg:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col lg:flex"
          >
            {/* Sidebar Header (no brand) */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="h-8" />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* New Chat Button */}
              <button
                onClick={handleNewChat}
                className="w-full bg-gradient-to-r from-primary-500 to-purple-600 text-white px-3 py-1.5 rounded-md font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
              >
                <Plus size={14} />
                <span>New Chat</span>
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-md focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 space-y-4">
                {/* Today */}
                {conversationGroups.today.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Today ({conversationGroups.today.length})
                    </h3>
                    <div className="space-y-0.5">
                      {conversationGroups.today.map((conv) => (
                        <ConversationItem
                          key={conv.id}
                          conversation={conv}
                          isActive={currentConversation?.id === conv.id}
                          onClick={() => selectConversation(conv)}
                          onDelete={(e) => handleDeleteConversation(conv.id, e)}
                          onRename={(e) => handleRenameConversation(conv, e)}
                          bot={availableBots.find(b => b.id === conv.botId)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Yesterday */}
                {conversationGroups.yesterday.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Yesterday ({conversationGroups.yesterday.length})
                    </h3>
                    <div className="space-y-0.5">
                      {conversationGroups.yesterday.map((conv) => (
                        <ConversationItem
                          key={conv.id}
                          conversation={conv}
                          isActive={currentConversation?.id === conv.id}
                          onClick={() => selectConversation(conv)}
                          onDelete={(e) => handleDeleteConversation(conv.id, e)}
                          onRename={(e) => handleRenameConversation(conv, e)}
                          bot={availableBots.find(b => b.id === conv.botId)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* This Week */}
                {conversationGroups.thisWeek.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      This Week ({conversationGroups.thisWeek.length})
                    </h3>
                    <div className="space-y-0.5">
                      {conversationGroups.thisWeek.map((conv) => (
                        <ConversationItem
                          key={conv.id}
                          conversation={conv}
                          isActive={currentConversation?.id === conv.id}
                          onClick={() => selectConversation(conv)}
                          onDelete={(e) => handleDeleteConversation(conv.id, e)}
                          onRename={(e) => handleRenameConversation(conv, e)}
                          bot={availableBots.find(b => b.id === conv.botId)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Older */}
                {conversationGroups.older.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Older ({conversationGroups.older.length})
                    </h3>
                    <div className="space-y-0.5">
                      {conversationGroups.older.map((conv) => (
                        <ConversationItem
                          key={conv.id}
                          conversation={conv}
                          isActive={currentConversation?.id === conv.id}
                          onClick={() => selectConversation(conv)}
                          onDelete={(e) => handleDeleteConversation(conv.id, e)}
                          onRename={(e) => handleRenameConversation(conv, e)}
                          bot={availableBots.find(b => b.id === conv.botId)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Models Quick Access */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Models
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowBotSelector(true)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Choose Model</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">current: {selectedBot?.name || '—'}</span>
                </button>
                <Link
                  to="/bots"
                  className="block w-full text-center px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
                >
                  Explore Models
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Link
                  to="/analytics"
                  className="flex flex-col items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Analytics"
                >
                  <BarChart3 size={18} className="text-primary-600 mb-1" />
                  <span className="text-xs text-gray-600 dark:text-gray-300">Analytics</span>
                </Link>
                <button
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                    rightPanelOpen
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
                  }`}
                  title="Settings"
                >
                  <Settings size={18} className="mb-1" />
                  <span className="text-xs">Settings</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex flex-col items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun size={18} className="text-yellow-500 mb-1" />
                  ) : (
                    <Moon size={18} className="text-gray-600 mb-1" />
                  )}
                  <span className="text-xs text-gray-600 dark:text-gray-300">Theme</span>
                </button>
              </div>
            </div>

            {/* User Menu */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Link
                    to="/profile"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-primary-500"
                    title="Profile"
                  >
                    <User size={16} />
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-red-500"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Backdrop for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <ChatHeader
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          rightPanelOpen={rightPanelOpen}
          setRightPanelOpen={setRightPanelOpen}
          selectedBot={selectedBot}
          onBotSelect={() => { loadBots(); setShowBotSelector(true) }}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <ChatArea />
          
          {/* Right Panel */}
          <AnimatePresence>
            {rightPanelOpen && (
              <motion.div
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ duration: 0.3 }}
                className="fixed lg:relative inset-y-0 right-0 z-30 w-80 lg:w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Bot Settings</h3>
                </div>
                
                <div className="flex-1 p-4 space-y-6">
                  {/* Current Model */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Model
                    </h4>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {selectedBot?.model || '—'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedBot?.description || 'Select a bot to view details'}
                      </div>
                    </div>
                  </div>

                  {/* Confidence */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confidence
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary-500 to-purple-600 h-2 rounded-full w-[87%]"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">87%</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Quick Actions
                    </h4>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                        🔄 Regenerate Response
                      </button>
                      <button onClick={handleSaveChatPDF} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                        💾 Save Chat
                      </button>
                      <button onClick={handleExportShare} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                        📤 Export
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right Panel Backdrop for Mobile */}
          {rightPanelOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setRightPanelOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Bot Selector Modal */}
      <BotSelector
        isOpen={showBotSelector}
        onClose={() => setShowBotSelector(false)}
        bots={availableBots}
        selectedBot={selectedBot}
      />
    </div>
  )
}

// Conversation Item Component
const ConversationItem = ({ conversation, isActive, onClick, onDelete, onRename, bot }) => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div
      className={`relative group px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-200 dark:border-primary-800'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="text-lg">{bot?.avatar || '🤖'}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {conversation.title}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {conversation.lastMessage}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {conversation.messageCount > 0 && (
            <div className="text-xs text-gray-400">
              {conversation.messageCount}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            <MoreVertical size={12} />
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <div className="absolute right-2 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(false)
              onRename?.(e)
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
          >
            <Edit3 size={12} />
            <span>Rename</span>
          </button>
          <button
            onClick={onDelete}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-red-600 dark:text-red-400"
          >
            <Trash2 size={12} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ChatPage
