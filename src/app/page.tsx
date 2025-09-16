'use client'

import { useAuth } from '@/contexts/auth-context'
import { AuthPage } from '@/components/auth/auth-page'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const [timeoutReached, setTimeoutReached] = useState(false)

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeoutReached(true)
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [])

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading IntroFuse...</p>
        </div>
      </div>
    )
  }

  // If loading timed out, show auth page
  if (timeoutReached && loading) {
    return <AuthPage />
  }

  if (!user) {
    return <AuthPage />
  }

  return <DashboardLayout />
}
