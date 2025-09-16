import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // This endpoint helps debug environment variable loading without exposing actual values
  const claudeKey = process.env.CLAUDE_API_KEY || ''
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    version: "enhanced-specificity-v2",
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID || 'local',
    region: process.env.VERCEL_REGION || 'unknown',
    claudeApiKey: {
      exists: !!claudeKey,
      length: claudeKey.length,
      firstChars: claudeKey.substring(0, 7) + '...',
      lastChars: '...' + claudeKey.substring(claudeKey.length - 4),
      isPlaceholder: claudeKey.includes('your_actual_')
    },
    supabaseUrl: {
      exists: !!supabaseUrl,
      length: supabaseUrl.length,
      isPlaceholder: supabaseUrl.includes('your_actual_')
    },
    timestamp: new Date().toISOString()
  })
}