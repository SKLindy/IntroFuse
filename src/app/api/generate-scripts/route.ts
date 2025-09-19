import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { claudeService } from '@/lib/claude'
import { AuthService } from '@/lib/auth'
import { ContentType } from '@/types/database'
import { extractUrlContent } from '@/lib/content-extractor'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (skip for testing)
    const user = await AuthService.getServerUser()
    const userId = user?.id || '97b40a42-c939-402f-bf70-e40989142552' // Use test user ID if no auth

    const body = await request.json()
    const { 
      contentSource, 
      contentType, 
      artist, 
      songTitle, 
      selectedStyle 
    }: {
      contentSource: string
      contentType: ContentType
      artist: string
      songTitle: string
      selectedStyle: string
    } = body

    // Validate input
    if (!contentSource || !artist || !songTitle || !selectedStyle) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Step 1: Check if song analysis exists in cache
    let songAnalysis
    const { data: existingSong } = await supabase
      .from('songs')
      .select('analysis')
      .eq('artist', artist)
      .eq('title', songTitle)
      .single()

    if (existingSong) {
      songAnalysis = existingSong.analysis
    } else {
      // Analyze song with Claude
      songAnalysis = await claudeService.analyzeSong(artist, songTitle)
      
      // Cache the analysis
      await supabase
        .from('songs')
        .insert({
          artist,
          title: songTitle,
          analysis: songAnalysis
        })
        .select()
        .single()
    }

    // Step 2: Process content based on type
    let actualContent = contentSource
    if (contentType === 'url') {
      console.log('Extracting content from URL:', contentSource)
      try {
        actualContent = await extractUrlContent(contentSource)
        console.log('URL content extracted, length:', actualContent.length)
        console.log('Content preview:', actualContent.substring(0, 300) + '...')
      } catch (error: any) {
        console.error('URL extraction failed:', error)
        return NextResponse.json(
          { error: `Failed to extract content from URL: ${error.message}` },
          { status: 400 }
        )
      }
    } else if (contentType === 'search') {
      console.log('Performing web search for:', contentSource)
      try {
        // Call the web-search API endpoint
        const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/web-search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: contentSource })
        })

        if (!searchResponse.ok) {
          throw new Error(`Web search API failed: ${searchResponse.status}`)
        }

        const searchData = await searchResponse.json()

        if (!searchData.results || searchData.results.length === 0) {
          throw new Error('No search results found')
        }

        // Convert search results to content summary
        actualContent = `BREAKING NEWS SEARCH RESULTS FOR: "${contentSource}"

${searchData.results.map((result: any, index: number) => `
${index + 1}. ${result.title}
Source: ${result.url}
Details: ${result.snippet}
`).join('\n')}

This information represents current breaking news developments that should be used for generating topical radio content.`

        console.log('Web search completed, content length:', actualContent.length)
        console.log('Search summary preview:', actualContent.substring(0, 300) + '...')
      } catch (error: any) {
        console.error('Web search failed:', error)
        return NextResponse.json(
          { error: `Failed to perform web search: ${error.message}` },
          { status: 400 }
        )
      }
    }

    // Step 3: Analyze content
    console.log('Content being analyzed:', { 
      contentType, 
      contentLength: actualContent.length,
      contentPreview: actualContent.substring(0, 200) + '...' 
    })
    const contentAnalysis = await claudeService.analyzeContent(actualContent, contentType)
    console.log('Content analysis result:', contentAnalysis)

    // Step 4: Content compliance check
    const complianceCheck = await claudeService.checkContentCompliance(actualContent)
    if (!complianceCheck.isCompliant) {
      return NextResponse.json(
        { 
          error: 'Content does not meet broadcast standards', 
          issues: complianceCheck.issues 
        }, 
        { status: 400 }
      )
    }

    // Step 5: Generate scripts
    const scriptResult = await claudeService.generateScripts(
      contentAnalysis,
      songAnalysis,
      artist,
      songTitle,
      selectedStyle
    )

    // Step 6: Save content session
    const { data: session, error: sessionError } = await supabase
      .from('content_sessions')
      .insert({
        user_id: userId,
        content_source: contentSource,
        content_type: contentType,
        content_analysis: contentAnalysis,
        artist,
        song_title: songTitle,
        song_analysis: songAnalysis,
        selected_style: selectedStyle,
        short_script: scriptResult.shortScript,
        long_script: scriptResult.longScript
      })
      .select()
      .single()

    if (sessionError) {
      console.error('Failed to save content session:', sessionError)
      // Continue anyway - the user still gets their scripts
    }

    return NextResponse.json({
      shortScript: scriptResult.shortScript,
      longScript: scriptResult.longScript,
      performanceNotes: scriptResult.performanceNotes,
      contentSummary: contentAnalysis?.summary,
      songAnalysis: songAnalysis,
      sessionId: session?.id
    })

  } catch (error: any) {
    console.error('Script generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate scripts' },
      { status: 500 }
    )
  }
}