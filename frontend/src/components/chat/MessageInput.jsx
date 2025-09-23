import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Smile, 
  X,
  Image,
  FileText
} from 'lucide-react'
import { useChat } from '../../contexts/ChatContext'

const MessageInput = ({ onSendMessage }) => {
  const { selectedBot } = useChat()
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const readFileAsText = (file) => new Promise((resolve) => {
    try {
      const reader = new FileReader()
      reader.onload = () => {
        const text = String(reader.result || '')
        resolve(text)
      }
      reader.onerror = () => resolve('')
      reader.readAsText(file)
    } catch {
      resolve('')
    }
  })

  const buildAttachmentText = async () => {
    if (!attachments.length) return ''
    const parts = []
    for (const att of attachments) {
      const type = att.file?.type || ''
      const name = att.name
      // Read only safe text-like files on the client
      if (type.startsWith('text/') || type === 'application/json' || type === 'text/markdown') {
        const raw = await readFileAsText(att.file)
        const max = 200 * 1024 // 200KB limit
        const trimmed = raw.length > max ? (raw.slice(0, max) + `\n\n[... trimmed ${raw.length - max} bytes ...]`) : raw
        parts.push(`\n\n[Attachment: ${name}]\n${trimmed}`)
      } else {
        parts.push(`\n\n[Attachment: ${name}] (type: ${type})`)
      }
    }
    return parts.join('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() && attachments.length === 0) return

    // Merge text + lightweight attachment content so the model can read it
    const attachmentText = await buildAttachmentText()
    const payload = `${message.trim()}${attachmentText}`.trim()

    if (payload) {
      onSendMessage(payload, 'text')
    }

    setMessage('')
    setAttachments([])
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleTextareaChange = (e) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }

  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            setIsRecording(true)
            // Implement actual recording logic here
          })
          .catch(err => {
            console.error('Error accessing microphone:', err)
          })
      }
    } else {
      // Stop recording
      setIsRecording(false)
      // Process recorded audio and send
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }))
    setAttachments(prev => [...prev, ...newAttachments])
  }

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image size={16} />
    return <FileText size={16} />
  }

  const emojis = ['😊', '😂', '🤔', '👍', '❤️', '🎉', '🔥', '💡', '✨', '🚀']
  const shortBotTitle = (() => {
    const name = selectedBot?.name || ''
    // remove common suffix words
    const cleaned = name.replace(/\b(assistant|tutor|advisor|bot)\b/gi, '').trim()
    return cleaned || name || 'Bot'
  })()

  return (
    <div
      className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-full shadow-[0_-4px_12px_-6px_rgba(0,0,0,0.25)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2"
              >
                {getFileIcon(attachment.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {attachment.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(attachment.size)}
                  </div>
                </div>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-wrap gap-2">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setMessage(prev => prev + emoji)
                  setShowEmojiPicker(false)
                }}
                className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 max-w-full">
        <div className="flex items-end space-x-2 sm:space-x-3">
          {/* Voice Recording Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={isRecording ? 'Stop recording' : 'Start voice recording'}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* File Attachment Button - Hidden on small screens */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:block p-2 sm:p-3 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Attach file"
          >
            <Paperclip size={18} />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative min-w-0">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full max-w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 bg-gray-100 dark:bg-gray-700 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            
            {/* Emoji Button - Hidden on very small screens */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="hidden xs:block absolute right-2 sm:right-3 bottom-2 sm:bottom-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Add emoji"
            >
              <Smile size={16} />
            </button>
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() && attachments.length === 0}
            className={`p-2 sm:p-3 rounded-full transition-all duration-200 ${
              message.trim() || attachments.length > 0
                ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:from-primary-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <Send size={18} />
          </button>
        </div>

        {/* Footer line under the input */}
        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
          <div className="truncate">
            Using: <span className="text-gray-600 dark:text-gray-300">{selectedBot?.avatar || '🤖'} {shortBotTitle}</span>
          </div>
          {message.length > 0 && (
            <div>{message.length} characters</div>
          )}
        </div>
      </form>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
    </div>
  )
}

export default MessageInput
