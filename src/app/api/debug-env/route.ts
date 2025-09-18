import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // This endpoint helps debug environment variable loading without exposing actual values
  const claudeKey = process.env.CLAUDE_API_KEY || ''
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  return NextResponse.json({
    environment: process.env.NODE_ENV,
    version: "auth-debug-v1",
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
      isPlaceholder: supabaseUrl.includes('your_actual_'),
      domain: supabaseUrl.includes('supabase.co') ? 'Valid Supabase domain' : 'Invalid domain'
    },
    supabaseAnonKey: {
      exists: !!supabaseAnonKey,
      length: supabaseAnonKey.length,
      firstChars: supabaseAnonKey.substring(0, 7) + '...',
      isPlaceholder: supabaseAnonKey.includes('your_actual_'),
      isJWT: supabaseAnonKey.startsWith('eyJ')
    },
    supabaseServiceKey: {
      exists: !!supabaseServiceKey,
      length: supabaseServiceKey.length,
      firstChars: supabaseServiceKey.substring(0, 7) + '...',
      isPlaceholder: supabaseServiceKey.includes('your_actual_'),
      isJWT: supabaseServiceKey.startsWith('eyJ')
    },
    timestamp: new Date().toISOString()
  })
}