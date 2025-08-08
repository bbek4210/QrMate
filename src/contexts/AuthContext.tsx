'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { User, SignupRequest } from '@/types/api'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (userData: SignupRequest) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  accessToken: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing token in localStorage
    const token = localStorage.getItem('qr-mate-access-token')
    const savedUser = localStorage.getItem('qr-mate-user')
    
    if (token && savedUser) {
      try {
        setAccessToken(token)
        setUser(JSON.parse(savedUser))
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        // Verify token is still valid by making a test request
        verifyToken(token)
      } catch (error) {
        console.error('Error parsing saved auth data:', error)
        clearAuthData()
      }
    }
    setIsLoading(false)
  }, [])

  const verifyToken = async (token: string) => {
    try {
      await api.user.getProfile()
      // Token is valid, keep user logged in
    } catch (error) {
      console.error('Token verification failed:', error)
      clearAuthData()
      toast.error('Session expired. Please login again.')
    }
  }

  const clearAuthData = () => {
    setUser(null)
    setAccessToken(null)
    delete axios.defaults.headers.common['Authorization']
    localStorage.removeItem('qr-mate-access-token')
    localStorage.removeItem('qr-mate-user')
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.auth.login({ email, password })

      if (response.status === 'SUCCESS' && response.data) {
        const { access_token, refresh_token, user: userData } = response.data
        
        setUser(userData)
        setAccessToken(access_token)
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        
        // Save to localStorage
        localStorage.setItem('qr-mate-access-token', access_token)
        localStorage.setItem('qr-mate-refresh-token', refresh_token)
        localStorage.setItem('qr-mate-user', JSON.stringify(userData))
        
        toast.success('Login successful!')
        return true
      } else {
        toast.error(response.message || 'Login failed')
        return false
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const message = error.response?.data?.message || 'Login failed. Please try again.'
      toast.error(message)
      return false
    }
  }

  const signup = async (userData: SignupRequest): Promise<boolean> => {
    try {
      const response = await api.auth.signup(userData)

      if (response.status === 'SUCCESS' && response.data) {
        const { access_token, refresh_token, user: newUser } = response.data
        
        setUser(newUser)
        setAccessToken(access_token)
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
        
        // Save to localStorage
        localStorage.setItem('qr-mate-access-token', access_token)
        localStorage.setItem('qr-mate-refresh-token', refresh_token)
        localStorage.setItem('qr-mate-user', JSON.stringify(newUser))
        
        toast.success('Account created successfully!')
        return true
      } else {
        toast.error(response.message || 'Registration failed')
        return false
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      const message = error.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(message)
      return false
    }
  }

  const logout = () => {
    clearAuthData()
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      isLoading, 
      accessToken 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 