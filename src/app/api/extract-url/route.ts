import { NextRequest, NextResponse } from 'next/server'
import { extractUrlContent } from '@/lib/content-extractor'
import { AuthService } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Skip auth for testing
    const user = await AuthService.getServerUser()
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const content = await extractUrlContent(url)

    return NextResponse.json({
      content,
      success: true
    })

  } catch (error: any) {
    console.error('URL extraction error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to extract URL content' },
      { status: 500 }
    )
  }
}