import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const claudeKey = process.env.CLAUDE_API_KEY

    return NextResponse.json({
      hasKey: !!claudeKey,
      keyLength: claudeKey?.length || 0,
      keyStart: claudeKey?.substring(0, 10) + '...' || 'none',
      isPlaceholder: claudeKey === 'placeholder-key' || claudeKey?.includes('your_actual_'),
      environment: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('CLAUDE'))
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}