import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const claudeKey = process.env.CLAUDE_API_KEY

    if (!claudeKey || claudeKey === 'placeholder-key') {
      return NextResponse.json(
        { error: 'Claude API key not configured' },
        { status: 500 }
      )
    }

    console.log('Testing Claude API with key:', claudeKey.substring(0, 10) + '...')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Just respond with "API test successful"'
          }
        ]
      }),
    })

    console.log('Claude response status:', response.status)
    console.log('Claude response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Claude error:', errorText)
      return NextResponse.json(
        {
          error: 'Claude API error',
          status: response.status,
          statusText: response.statusText,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('Claude response:', data)

    return NextResponse.json({
      success: true,
      response: data
    })

  } catch (error: any) {
    console.error('Test error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}