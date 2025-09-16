'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, AuthUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string, stationId?: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for bypass parameter first
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('bypass') === 'true') {
      console.log('Auth bypass enabled')
      // Create a mock user for bypass mode
      const mockUser = {
        id: 'bypass-user',
        email: 'bypass@test.com',
        username: 'Bypass User',
        role: 'station_user' as const,
        station_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        hasRole: () => true,
        canAccessStation: () => true
      }
      setUser(mockUser)
      setLoading(false)
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Failed to get initial session:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session) {
            const currentUser = await AuthService.getCurrentUser()
            setUser(currentUser)
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Auth state change error:', error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await AuthService.signIn(email, password)
      // User will be set via auth state change listener
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, username: string, stationId?: string) => {
    setLoading(true)
    try {
      await AuthService.signUp(email, password, username, stationId)
      // User will be set via auth state change listener
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await AuthService.signOut()
      // User will be cleared via auth state change listener
    } catch (error) {
      setLoading(false)
      throw error
    }
  }

  const refreshUser = async () => {
    const currentUser = await AuthService.getCurrentUser()
    setUser(currentUser)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}