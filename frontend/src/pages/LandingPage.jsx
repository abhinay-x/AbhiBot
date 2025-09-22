import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Mic, 
  Network, 
  MessageSquare, 
  Zap, 
  Shield, 
  Globe, 
  Headphones,
  Clock,
  Menu,
  X,
  ChevronRight,
  Sun
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedBot, setSelectedBot] = useState('business')

  const botTypes = {
    business: {
      icon: '💼',
      title: 'Business Assistant',
      messages: [
        { sender: 'user', text: 'Help me create a marketing strategy' },
        { sender: 'bot', text: 'I\'d be happy to help! Let\'s start by identifying your target audience and key value propositions...' }
      ]
    },
    educational: {
      icon: '🎓',
      title: 'Educational Tutor',
      messages: [
        { sender: 'user', text: 'Explain quantum physics simply' },
        { sender: 'bot', text: 'Quantum physics is like nature\'s magic trick! Imagine particles that can be in multiple places at once...' }
      ]
    },
    technical: {
      icon: '💻',
      title: 'Technical Expert',
      messages: [
        { sender: 'user', text: 'Help me debug this React component' },
        { sender: 'bot', text: 'I\'ll help you debug that! Can you share the component code and describe the issue you\'re experiencing?' }
      ]
    },
    creative: {
      icon: '✍️',
      title: 'Creative Writer',
      messages: [
        { sender: 'user', text: 'Write a short story about AI' },
        { sender: 'bot', text: 'In the year 2045, Maya discovered her AI companion wasn\'t just code—it was dreaming...' }
      ]
    },
    health: {
      icon: '🏥',
      title: 'Health Assistant',
      messages: [
        { sender: 'user', text: 'Tips for better sleep?' },
        { sender: 'bot', text: 'Great question! Here are evidence-based tips for improving sleep quality: 1. Maintain a consistent sleep schedule...' }
      ]
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
      {/* Floating Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-blob"></div>
        <div className="floating-blob"></div>
        <div className="floating-blob"></div>
      </div>

      {/* Subtle backdrop layer to improve foreground readability */}
      <div className="absolute inset-0 bg-white/10 dark:bg-gray-900/10 backdrop-blur-[1px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🤖</span>
            </div>
            <span className="text-xl font-bold gradient-text">AI ChatBot Pro</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Pricing
            </a>
            <a href="#demo" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              Demo
            </a>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <Link
              to="/login"
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile Menu + Backdrop */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop to blur and dim background */}
            <div
              className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              role="dialog"
              aria-modal="true"
              className="md:hidden fixed top-16 left-0 right-0 z-[9999] mx-4 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl"
            >
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-inner">
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-white/30 dark:border-gray-600/50 bg-gradient-to-r from-white/60 to-gray-50/80 dark:from-gray-800/60 dark:to-gray-900/80 backdrop-blur-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm">🤖</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">Menu</span>
                  </div>
                  <button
                    className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <X size={20} className="text-gray-700 dark:text-gray-200" />
                  </button>
                </div>

                {/* Navigation Items */}
                <div className="px-3 py-3 space-y-1">
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-100 backdrop-blur-sm transition-all duration-200 group"
                  >
                    <span className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary-500/20 to-purple-500/20 flex items-center justify-center">
                        <Zap size={16} className="text-primary-600" />
                      </div>
                      <span className="font-medium">Features</span>
                    </span>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </a>
                  <a
                    href="#pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-100 backdrop-blur-sm transition-all duration-200 group"
                  >
                    <span className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                        <Shield size={16} className="text-green-600" />
                      </div>
                      <span className="font-medium">Pricing</span>
                    </span>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-green-500 transition-colors" />
                  </a>
                  <a
                    href="#demo"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-100 backdrop-blur-sm transition-all duration-200 group"
                  >
                    <span className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                        <MessageSquare size={16} className="text-blue-600" />
                      </div>
                      <span className="font-medium">Demo</span>
                    </span>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </a>
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-3 border-t border-white/30 dark:border-gray-600/50 bg-gradient-to-r from-gray-50/80 to-white/60 dark:from-gray-800/60 dark:to-gray-900/80">
                  <button
                    onClick={() => { toggleTheme(); setMobileMenuOpen(false) }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/60 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-100 backdrop-blur-sm transition-all duration-200 group"
                  >
                    <span className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                        <Sun size={16} className="text-yellow-600" />
                      </div>
                      <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </span>
                    <ChevronRight size={16} className="text-gray-400 group-hover:text-yellow-500 transition-colors" />
                  </button>
                </div>

                {/* Auth Actions */}
                <div className="px-4 py-4 space-y-3 bg-gradient-to-b from-transparent to-white/30 dark:to-gray-800/30">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl border border-white/40 dark:border-gray-600/50 text-gray-800 dark:text-gray-100 hover:bg-white/60 dark:hover:bg-gray-700/60 backdrop-blur-sm transition-all duration-200 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg hover:from-primary-600 hover:to-purple-700 transition-all duration-200 font-semibold hover:shadow-xl"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative z-0 px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Your Intelligent{' '}
                  <span className="gradient-text">AI Assistant</span>{' '}
                  for Every Task
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  From code help to creative writing - powered by cutting-edge Hugging Face models. 
                  Experience the future of AI conversation today.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-primary-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group"
                >
                  Try Demo Chat
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-primary-500 text-primary-600 dark:text-primary-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 flex items-center justify-center"
                >
                  Start Free Trial
                </Link>
              </div>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-4">
                <div className="glass px-4 py-2 rounded-full flex items-center space-x-2">
                  <Globe size={16} className="text-primary-500" />
                  <span className="text-sm font-medium">50+ Languages</span>
                </div>
                <div className="glass px-4 py-2 rounded-full flex items-center space-x-2">
                  <Headphones size={16} className="text-primary-500" />
                  <span className="text-sm font-medium">Voice Enabled</span>
                </div>
                <div className="glass px-4 py-2 rounded-full flex items-center space-x-2">
                  <Clock size={16} className="text-primary-500" />
                  <span className="text-sm font-medium">24/7 Available</span>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Live Chat Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="glass rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Live Demo</div>
                </div>

                <div className="space-y-4 h-80 overflow-y-auto">
                  {botTypes[selectedBot].messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.5 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing Indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mic size={16} />
                    <span>Type a message or use voice...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-0 px-4 sm:px-6 lg:px-8 py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful AI Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the next generation of AI assistance with our comprehensive suite of intelligent features
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="glass rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Multiple AI Models</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Switch between GPT, CodeBERT, BERT models instantly. Each specialized for different tasks and optimized for performance.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mic className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Voice Conversations</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Talk naturally with speech-to-text and voice responses. Experience seamless voice interactions with AI.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="glass rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Network className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Smart Context</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Remembers conversation history and context. Get more relevant and personalized responses over time.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="relative z-0 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Interactive Bot Selector
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose from our specialized AI assistants, each trained for specific domains and tasks
            </p>
          </motion.div>

          {/* Bot Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {Object.entries(botTypes).map(([key, bot]) => (
              <button
                key={key}
                onClick={() => setSelectedBot(key)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center space-x-2 ${
                  selectedBot === key
                    ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white shadow-lg'
                    : 'glass hover:shadow-lg'
                }`}
              >
                <span className="text-xl">{bot.icon}</span>
                <span>{bot.title}</span>
              </button>
            ))}
          </div>

          {/* Sample Conversation */}
          <motion.div
            key={selectedBot}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto glass rounded-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{botTypes[selectedBot].icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {botTypes[selectedBot].title}
                  </h3>
                  <p className="text-sm text-green-500 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Online
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Confidence Score</div>
                <div className="text-lg font-bold text-primary-600">94%</div>
              </div>
            </div>

            <div className="space-y-4">
              {botTypes[selectedBot].messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: message.sender === 'user' ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-md px-6 py-4 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-primary-500 to-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}>
                    <p>{message.text}</p>
                    {message.sender === 'bot' && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex space-x-2">
                          <button className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors">
                            📋 Copy
                          </button>
                          <button className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors">
                            🔄 Regenerate
                          </button>
                          <button className="text-xs px-2 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors">
                            ⭐ Rate
                          </button>
                        </div>
                        <div className="text-xs opacity-70">1.2s response</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-0 px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-r from-primary-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Ready to Experience the Future?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already leveraging AI to boost their productivity and creativity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </Link>
              <Link
                to="/chat"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-200"
              >
                Try Demo Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
