import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
axios.defaults.baseURL = API_BASE_URL

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Set up axios interceptor for token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Check if user is authenticated on app start
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')
      
      if (savedToken && savedUser) {
        try {
          setToken(savedToken)
          setUser(JSON.parse(savedUser))
          
          // Verify token is still valid (use /me which exists on backend)
          await axios.get('/api/auth/me')
        } catch (error) {
          console.error('Token verification failed:', error)
          logout()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password })
      // Backend returns: { message, user, tokens: { accessToken, refreshToken, expiresIn } }
      const { tokens, user: userData } = response.data
      const newToken = tokens?.accessToken
      const displayUser = { ...userData }
      if (!displayUser.name) {
        displayUser.name = [userData.firstName, userData.lastName].filter(Boolean).join(' ').trim() || userData.email?.split('@')[0] || 'User'
      }
      
      setToken(newToken)
      setUser(displayUser)
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(displayUser))
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      const status = error.response?.status
      const backendMsg = error.response?.data?.message || error.response?.data?.error
      let uiMessage = backendMsg || 'Login failed'
      if (status === 401) {
        uiMessage = backendMsg || 'Invalid email or password'
      }
      return { success: false, error: uiMessage }
    }
  }

  const signup = async (userData) => {
    try {
      // Normalize payload to match backend validation (requires firstName, lastName, email, password)
      let firstName = userData.firstName
      let lastName = userData.lastName
      // Support UIs that pass a single name/fullName
      const nameInput = userData.name || userData.fullName
      if ((!firstName || !lastName) && nameInput) {
        const parts = String(nameInput).trim().split(/\s+/)
        firstName = firstName || parts[0] || ''
        lastName = lastName || (parts.length > 1 ? parts.slice(1).join(' ') : 'User')
      }
      const payload = {
        email: userData.email,
        password: userData.password,
        firstName: firstName || 'User',
        lastName: lastName || 'Account',
      }
      // Backend route is /api/auth/register
      const response = await axios.post('/api/auth/register', payload)
      const { tokens, user: newUser } = response.data
      const newToken = tokens?.accessToken
      const displayUser = { ...newUser }
      if (!displayUser.name) {
        displayUser.name = [newUser.firstName, newUser.lastName].filter(Boolean).join(' ').trim() || newUser.email?.split('@')[0] || 'User'
      }
      
      setToken(newToken)
      setUser(displayUser)
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(displayUser))
      
      return { success: true, user: newUser }
    } catch (error) {
      console.error('Signup error:', error)
      const status = error.response?.status
      const backendMsg = error.response?.data?.message || error.response?.data?.error
      let uiMessage = backendMsg || 'Signup failed'
      if (status === 409) {
        uiMessage = backendMsg || 'An account with this email already exists'
      } else if (status === 400) {
        uiMessage = backendMsg || 'Please check your details and try again'
      }
      return { success: false, error: uiMessage }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }

  const updateUser = async (updates) => {
    try {
      const response = await axios.put('/api/auth/profile', updates)
      const updatedUser = response.data.user
      const displayUser = { ...updatedUser }
      if (!displayUser.name) {
        displayUser.name = [updatedUser.firstName, updatedUser.lastName].filter(Boolean).join(' ').trim() || updatedUser.email?.split('@')[0] || 'User'
      }
      
      setUser(displayUser)
      localStorage.setItem('user', JSON.stringify(displayUser))
      
      return { success: true, user: updatedUser }
    } catch (error) {
      console.error('Update user error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Update failed' 
      }
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
