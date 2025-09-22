import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ChatProvider } from './contexts/ChatContext'

// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ChatPage from './pages/ChatPage'
import BotsPage from './pages/BotsPage'
import BotConfigPage from './pages/BotConfigPage'
import AnalyticsPage from './pages/AnalyticsPage'
import IntegrationsPage from './pages/IntegrationsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import HelpPage from './pages/HelpPage'
import NotificationsPage from './pages/NotificationsPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  useEffect(() => {
    document.title = 'AbhiBot'
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Routes>
                {/* Default to Chat Interface */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                {/* Protected Routes */}
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                } />
                <Route path="/bots" element={
                  <ProtectedRoute>
                    <BotsPage />
                  </ProtectedRoute>
                } />
                <Route path="/bots/config/:id" element={
                  <ProtectedRoute>
                    <BotConfigPage />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                } />
                <Route path="/integrations" element={
                  <ProtectedRoute>
                    <IntegrationsPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/preferences" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/help" element={
                  <ProtectedRoute>
                    <HelpPage />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
