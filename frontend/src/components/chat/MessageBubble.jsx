import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion } from 'framer-motion'
import { 
  Copy, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown, 
  Volume2,
  Check,
  MoreHorizontal
} from 'lucide-react'
import { useChat } from '../../contexts/ChatContext'

const MessageBubble = ({ message }) => {
  const { selectedBot } = useChat()
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(null) // null, true, false
  const [showActions, setShowActions] = useState(false)

  const isUser = message.sender === 'user'
  const isBot = message.sender === 'bot'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const handleSpeak = () => {
    try {
      if (!('speechSynthesis' in window)) {
        console.warn('SpeechSynthesis not supported in this browser')
        return
      }
      const text = String(message?.content || '').trim()
      if (!text) return

      // Stop any ongoing speech to avoid overlap
      window.speechSynthesis.cancel()
      // Some browsers can be stuck paused; make sure we resume
      try { window.speechSynthesis.resume?.() } catch {}

      const utterance = new SpeechSynthesisUtterance(text)
      // Optional tuning
      utterance.rate = 1
      utterance.pitch = 1
      utterance.volume = 1
      utterance.lang = 'en-US'

      utterance.onerror = (e) => {
        console.error('TTS utterance error:', e?.error || e)
      }
      utterance.onend = () => {
        // no-op; can hook UI if needed
      }

      // Try picking an English voice by default
      const pickVoice = () => {
        const voices = window.speechSynthesis.getVoices?.() || []
        if (voices.length) {
          const en = voices.find(v => /en(-|_)?/i.test(v.lang)) || voices[0]
          utterance.voice = en
        }
        window.speechSynthesis.speak(utterance)
      }

      // Ensure we subscribe before querying, some browsers fire the event quickly
      let handled = false
      window.speechSynthesis.onvoiceschanged = () => {
        if (handled) return
        handled = true
        pickVoice()
        window.speechSynthesis.onvoiceschanged = null
      }
      const voicesNow = window.speechSynthesis.getVoices?.() || []
      if (voicesNow.length) {
        handled = true
        pickVoice()
        window.speechSynthesis.onvoiceschanged = null
      } else {
        // Some engines require a micro delay before voices populate
        setTimeout(() => {
          if (handled) return
          const laterVoices = window.speechSynthesis.getVoices?.() || []
          if (laterVoices.length) {
            handled = true
            pickVoice()
            window.speechSynthesis.onvoiceschanged = null
          } else {
            // As a last resort, speak without a selected voice
            window.speechSynthesis.speak(utterance)
          }
        }, 150)
      }
    } catch (err) {
      console.error('TTS error:', err)
    }
  }

  const handleRegenerate = () => {
    // Implement regenerate functionality
    console.log('Regenerate message')
  }

  const handleLike = (isLike) => {
    setLiked(isLike)
    // Send feedback to backend
    console.log('Message feedback:', isLike ? 'like' : 'dislike')
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {isBot && (
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 text-lg">{selectedBot?.avatar || '🤖'}</div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {selectedBot?.name || 'AI Assistant'}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`relative px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
              : 'glass text-gray-900 dark:text-white'
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* Message Content (render Markdown) */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a({href, children, ...props}) {
                  return (
                    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                      {children}
                    </a>
                  )
                },
                code({inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline ? (
                    <pre className="overflow-auto rounded-md bg-gray-900 text-gray-100 p-3">
                      <code className={className} {...props}>{children}</code>
                    </pre>
                  ) : (
                    <code className="bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5" {...props}>{children}</code>
                  )
                }
              }}
            >
              {String(message.content || '')}
            </ReactMarkdown>
          </div>

          {/* Message Time */}
          <div className={`text-xs mt-2 ${
            isUser 
              ? 'text-white/70' 
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {formatTime(message.timestamp)}
            {message.confidence && (
              <span className="ml-2">• Confidence: {message.confidence}%</span>
            )}
          </div>

          {/* Bot Message Actions */}
          {isBot && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: showActions ? 1 : 0, 
                y: showActions ? 0 : 10 
              }}
              className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center space-x-2">
                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Copy message"
                >
                  {copied ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} className="text-gray-500 dark:text-gray-400" />
                  )}
                </button>

                {/* Speak Button */}
                <button
                  onClick={handleSpeak}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Read aloud"
                >
                  <Volume2 size={14} className="text-gray-500 dark:text-gray-400" />
                </button>

                {/* Regenerate Button */}
                <button
                  onClick={handleRegenerate}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Regenerate response"
                >
                  <RotateCcw size={14} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Like/Dislike */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleLike(true)}
                  className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                    liked === true ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'
                  }`}
                  title="Like response"
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  onClick={() => handleLike(false)}
                  className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                    liked === false ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                  }`}
                  title="Dislike response"
                >
                  <ThumbsDown size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Response Time (for bot messages) */}
        {isBot && message.responseTime && (
          <div className="text-xs text-gray-400 mt-1 ml-2">
            Response time: {message.responseTime}s
          </div>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
