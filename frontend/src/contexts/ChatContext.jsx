import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import axios from 'axios'

const ChatContext = createContext()

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth()
  const [socket, setSocket] = useState(null)
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [selectedBot, setSelectedBot] = useState(null)
  const [availableBots, setAvailableBots] = useState([])

  // Helper: auth headers for axios per-call to avoid race with global defaults
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token
        }
      })

      newSocket.on('connect', () => {
        console.log('Connected to chat server')
      })

      // Socket auth result
      newSocket.on('authenticated', () => {
        // join current conversation if any
        if (currentConversation?.id) {
          newSocket.emit('join_conversation', { conversationId: currentConversation.id })
        }
      })

      // Realtime incoming user message (from others or echo)
      newSocket.on('message_received', ({ message }) => {
        const convId = message.conversation?.toString?.() || message.conversation
        // Only show messages for the active conversation in this messages array
        if (convId !== currentConversation?.id) return
        const m = {
          id: message._id,
          content: message.content?.text || '',
          type: message.content?.type || 'text',
          sender: message.sender?.type || 'user',
          timestamp: message.createdAt,
          conversationId: convId
        }
        setMessages(prev => [...prev, m])
        // Update conversation metadata (lastMessage and count)
        setConversations(prev => {
          const next = prev.map(c => c.id === convId 
            ? { ...c, lastMessage: m.content, messageCount: (c.messageCount || 0) + 1, timestamp: m.timestamp }
            : c
          )
          updateBotChatCounts(next)
          return next
        })
      })

      // Bot response lifecycle
      newSocket.on('message_started', ({ message }) => {
        const convId = message.conversation?.toString?.() || message.conversation
        if (convId !== currentConversation?.id) return
        const m = {
          id: message._id,
          content: message.content?.text || '',
          type: 'text',
          sender: 'bot',
          timestamp: message.createdAt,
          conversationId: convId
        }
        setMessages(prev => [...prev, m])
      })

      newSocket.on('message_chunk', ({ messageId, chunk, fullText }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: fullText || (m.content + (chunk || '')) } : m))
      })

      newSocket.on('message_completed', ({ message }) => {
        const convId = message.conversation?.toString?.() || message.conversation
        if (convId !== currentConversation?.id) return
        setMessages(prev => prev.map(m => m.id === message._id ? { ...m, content: message.content?.text || m.content } : m))
        // Count bot message
        setConversations(prev => {
          const next = prev.map(c => c.id === convId 
            ? { ...c, lastMessage: message.content?.text || c.lastMessage, messageCount: (c.messageCount || 0) + 1, timestamp: message.createdAt }
            : c
          )
          updateBotChatCounts(next)
          return next
        })
      })

      newSocket.on('message_failed', ({ messageId, error }) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: `[Error] ${error}` } : m))
      })

      newSocket.on('typing', ({ isTyping: typing }) => {
        setIsTyping(typing)
      })

      newSocket.on('conversation_created', (conversation) => {
        setConversations(prev => [conversation, ...prev])
        setCurrentConversation(conversation)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, currentConversation?.id])

  // Load available bots from backend
  const loadBots = useCallback(async () => {
      if (!token) {
        // Provide immediate UI fallback while auth initializes
        const fallbackBots = [
          { id: 'fallback-technical', name: 'Technical Assistant', avatar: '💻', model: 'model', description: 'Expert in programming and technical solutions', category: 'technical', online: true, rating: 4.6, chats: 0 },
          { id: 'fallback-creative', name: 'Creative Writer', avatar: '✍️', model: 'model', description: 'Creative writing and content generation', category: 'creative', online: true, rating: 4.5, chats: 0 }
        ]
        setAvailableBots(prev => prev.length ? prev : fallbackBots)
        if (!selectedBot) setSelectedBot(fallbackBots[0])
        return
      }
      try {
        const res = await axios.get('/api/bots', { headers: authHeaders })
        const typeToUiCategory = (t) => {
          // map backend types to UI categories
          switch (t) {
            case 'code_assistant':
              return 'technical'
            case 'creative':
            case 'creative-writing':
              return 'creative'
            case 'educational':
              return 'education'
            case 'health':
              return 'health'
            case 'financial':
            case 'customer_support':
            default:
              return 'business'
          }
        }
        const bots = (res.data?.bots || []).map(b => ({
          id: b._id,
          name: b.name,
          avatar: b.avatar || '🤖',
          model: b.model?.modelId || b.model?.provider || 'model',
          description: b.description || '',
          category: typeToUiCategory(b.type || b.category),
          online: true,
          rating: b.rating || 4.5,
          chats: b.usage?.totalConversations || 0
        }))
        if (bots.length > 0) {
          setAvailableBots(bots)
          if (!selectedBot) setSelectedBot(bots[0])
        } else {
          // Fallback: load in-memory specialized templates from backend
          try {
            const tmplRes = await axios.get('/api/bots/templates/specialized', { headers: authHeaders })
            const templates = tmplRes.data?.templates || {}
            const templateEmoji = {
              customer_support: '🛟',
              educational: '🎓',
              creative: '✍️',
              code_assistant: '💻',
              health: '🏥',
              financial: '💰'
            }
            const templateBots = Object.entries(templates).map(([key, t]) => ({
              id: key, // template key used temporarily
              name: t.name,
              avatar: templateEmoji[key] || '🤖',
              model: t.model?.name || 'model',
              description: t.description || '',
              category: (
                key === 'code_assistant' ? 'technical' :
                key === 'creative' ? 'creative' :
                key === 'educational' ? 'education' :
                key === 'health' ? 'health' : 'business'
              ),
              online: true,
              rating: 4.6,
              chats: 0,
              templateType: key // mark as template for creation flow
            }))
            setAvailableBots(templateBots)
            if (!selectedBot && templateBots.length) setSelectedBot(templateBots[0])
          } catch (e) {
            console.error('Failed to load bot templates:', e)
            // Final UI fallback so selector isn't empty
            const fallbackBots = [
              { id: 'fallback-technical', name: 'Technical Assistant', avatar: '💻', model: 'model', description: 'Expert in programming and technical solutions', category: 'technical', online: true, rating: 4.6, chats: 0 },
              { id: 'fallback-creative', name: 'Creative Writer', avatar: '✍️', model: 'model', description: 'Creative writing and content generation', category: 'creative', online: true, rating: 4.5, chats: 0 },
              { id: 'fallback-education', name: 'Education Tutor', avatar: '🎓', model: 'model', description: 'Learning and educational support', category: 'education', online: true, rating: 4.7, chats: 0 }
            ]
            setAvailableBots(fallbackBots)
            if (!selectedBot) setSelectedBot(fallbackBots[0])
          }
        }
      } catch (err) {
        console.error('Failed to load bots:', err)
        // Also provide final fallback on outright API failure
        const fallbackBots = [
          { id: 'fallback-technical', name: 'Technical Assistant', avatar: '💻', model: 'model', description: 'Expert in programming and technical solutions', category: 'technical', online: true, rating: 4.6, chats: 0 },
          { id: 'fallback-creative', name: 'Creative Writer', avatar: '✍️', model: 'model', description: 'Creative writing and content generation', category: 'creative', online: true, rating: 4.5, chats: 0 }
        ]
        setAvailableBots(fallbackBots)
        if (!selectedBot) setSelectedBot(fallbackBots[0])
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, selectedBot])

  useEffect(() => {
    loadBots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Load conversations
  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    try {
      const res = await axios.get('/api/chat/conversations', { headers: authHeaders })
      const convs = (res.data?.conversations || []).map(c => ({
        id: c._id,
        title: c.title || (c.bot?.name ? `Chat with ${c.bot.name}` : 'Conversation'),
        botId: c.bot?._id || c.bot,
        botName: c.bot?.name,
        lastMessage: '',
        timestamp: c.updatedAt || c.createdAt,
        messageCount: c.messageCount || 0
      }))
      setConversations(convs)
      updateBotChatCounts(convs)
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }

  const sendMessage = async (content, type = 'text') => {
    if (!currentConversation) return
    // If socket is connected, do NOT optimistic add (server will echo via message_received)
    if (socket && socket.connected) {
      socket.emit('send_message', { conversationId: currentConversation.id, content, type })
      return
    }
    // REST fallback + optimistic UI
    const localMsg = {
      id: `local-${Date.now()}`,
      content,
      type,
      sender: 'user',
      timestamp: new Date(),
      conversationId: currentConversation.id
    }
    setMessages(prev => [...prev, localMsg])
    setConversations(prev => prev.map(c => c.id === currentConversation.id 
      ? { ...c, lastMessage: content, messageCount: (c.messageCount || 0) + 1, timestamp: localMsg.timestamp }
      : c
    ))
    try {
      await axios.post(`/api/chat/conversations/${currentConversation.id}/messages`, { content, type }, { headers: authHeaders })
    } catch (err) {
      console.error('Failed to send message via REST:', err)
    }
  }

  const createConversation = async (title, botId) => {
    try {
      let useBotId = botId || selectedBot?.id

      // If selected bot is a template, create a real bot first
      if (selectedBot && selectedBot.templateType && (!botId || botId === selectedBot.id)) {
        try {
          const created = await axios.post('/api/bots/create-from-template', {
            templateType: selectedBot.templateType,
            customizations: { name: selectedBot.name, description: selectedBot.description }
          })
          useBotId = created.data?.bot?._id || useBotId
          // After creating, refresh bots list to include the new one
          // (non-blocking refresh)
          axios.get('/api/bots', { headers: authHeaders }).then(r => {
            const fresh = (r.data?.bots || []).map(b => ({
              id: b._id,
              name: b.name,
              avatar: b.avatar || '🤖',
              model: b.model?.modelId || b.model?.provider || 'model',
              description: b.description || '',
              online: true,
              rating: b.rating || 4.5,
              chats: b.usage?.totalConversations || 0
            }))
            setAvailableBots(fresh)
            // pick the newly created as selected if found
            const createdBot = fresh.find(b => b.id === useBotId)
            if (createdBot) setSelectedBot(createdBot)
          }).catch(() => {})
        } catch (e) {
          console.error('Failed to create bot from template:', e)
        }
      }

      const res = await axios.post('/api/chat/conversations', { botId: useBotId, title }, { headers: authHeaders })
      const conv = res.data?.conversation
      const uiConv = {
        id: conv?._id,
        title: conv?.title || 'Conversation',
        botId: conv?.bot?._id || conv?.bot,
        botName: selectedBot?.name || conv?.bot?.name,
        timestamp: conv?.createdAt,
        messageCount: 0
      }
      setConversations(prev => [uiConv, ...prev])
      setCurrentConversation(uiConv)
      setMessages([])
      // Join the new conversation room so we receive bot stream events
      if (socket?.connected && uiConv.id) {
        socket.emit('join_conversation', { conversationId: uiConv.id })
      }
      updateBotChatCounts([uiConv, ...conversations])
      return uiConv
    } catch (err) {
      console.error('Failed to create conversation:', err)
      return null
    }
  }

  const selectConversation = (conversation) => {
    setCurrentConversation(conversation)
    // Load messages for this conversation
    loadMessages(conversation.id)
    // Join socket room
    if (socket?.connected && conversation?.id) {
      socket.emit('join_conversation', { conversationId: conversation.id })
    }
  }

  const loadMessages = async (conversationId) => {
    try {
      const res = await axios.get(`/api/chat/conversations/${conversationId}/messages`, { headers: authHeaders })
      const msgs = (res.data?.messages || []).map(m => ({
        id: m._id,
        content: m.content?.text || '',
        sender: m.sender?.type || 'bot',
        timestamp: m.createdAt,
        conversationId
      }))
      setMessages(msgs)
    } catch (err) {
      console.error('Failed to load messages:', err)
      setMessages([])
    }
  }

  // API: rename and delete conversations
  const renameConversation = async (conversationId, title) => {
    try {
      const res = await axios.patch(`/api/chat/conversations/${conversationId}`, { title }, { headers: authHeaders })
      const updated = res.data?.conversation
      setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, title: updated?.title || title } : c))
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => ({ ...prev, title: updated?.title || title }))
      }
      return true
    } catch (err) {
      console.error('Failed to rename conversation:', err)
      return false
    }
  }

  const deleteConversation = async (conversationId) => {
    try {
      await axios.delete(`/api/chat/conversations/${conversationId}`, { headers: authHeaders })
    } catch (err) {
      console.warn('Server delete failed or already deleted, removing locally', err)
    }
    setConversations(prev => prev.filter(c => c.id !== conversationId))
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null)
      setMessages([])
    }
    // Recompute bot counts
    setTimeout(() => updateBotChatCounts(), 0)
  }

  // Compute and update availableBots.chats from conversations
  const updateBotChatCounts = (convs = conversations) => {
    const idCounts = {}
    const nameCounts = {}
    for (const c of convs) {
      if (c.botId) idCounts[String(c.botId)] = (idCounts[String(c.botId)] || 0) + 1
      const nm = (c.botName || '').toLowerCase().trim()
      if (nm) nameCounts[nm] = (nameCounts[nm] || 0) + 1
    }
    setAvailableBots(prev => prev.map(b => {
      const byId = idCounts[String(b.id)] || 0
      const byName = nameCounts[(b.name || '').toLowerCase().trim()] || 0
      return { ...b, chats: byId || byName }
    }))
  }

  const value = {
    socket,
    conversations,
    currentConversation,
    messages,
    isTyping,
    selectedBot,
    availableBots,
    setSelectedBot,
    loadBots,
    sendMessage,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    loadConversations
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
