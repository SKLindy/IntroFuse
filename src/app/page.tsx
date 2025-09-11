'use client'

import { useAuth } from '@/contexts/auth-context'
import { AuthPage } from '@/components/auth/auth-page'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return <DashboardLayout />
}
