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
    // Get initial session
    const getInitialSession = async () => {
      const currentUser = await AuthService.getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const currentUser = await AuthService.getCurrentUser()
          setUser(currentUser)
        } else {
          setUser(null)
        }
        setLoading(false)
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