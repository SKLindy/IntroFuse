'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'

export default function Home() {
  return (
    <>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to IntroFuse</h1>
            <p className="text-xl text-muted-foreground mb-8">AI-Powered Radio Script Generator</p>
            <SignInButton mode="modal">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-md text-lg">
                Sign In to Get Started
              </button>
            </SignInButton>
          </div>
        </div>
      </SignedOut>
      <SignedIn>
        <DashboardLayout />
      </SignedIn>
    </>
  )
}
