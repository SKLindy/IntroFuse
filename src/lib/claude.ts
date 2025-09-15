import { Song, ContentSession } from '@/types/database'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022' // Latest Claude 3.5 Sonnet model

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeResponse {
  content: Array<{
    type: string
    text: string
  }>
}

class ClaudeService {
  private apiKey: string
  private model: string

  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY || 'placeholder-key'
    this.model = CLAUDE_MODEL // Using latest Claude 3.5 Sonnet
    
    // Debug API key loading
    if (typeof window === 'undefined') {
      console.log('Claude API Key Debug:', {
        exists: !!this.apiKey,
        length: this.apiKey?.length || 0,
        firstChars: this.apiKey?.substring(0, 7) + '...' || 'none',
        isPlaceholder: this.apiKey === 'placeholder-key' || this.apiKey?.includes('your_actual_'),
        environment: process.env.NODE_ENV
      })
      
      if (process.env.NODE_ENV === 'production' && (this.apiKey === 'placeholder-key' || this.apiKey?.includes('your_actual_'))) {
        console.error('Missing or invalid CLAUDE_API_KEY in production environment')
      }
    }
  }


  private async makeRequest(messages: ClaudeMessage[]): Promise<string> {
    if (!this.apiKey || this.apiKey === 'placeholder-key') {
      throw new Error('Claude API key not configured')
    }

    try {
      console.log('Making Claude API request with', {
        model: this.model,
        messageCount: messages.length,
        firstMessageLength: messages[0]?.content?.length || 0
      })

      const requestBody = {
        model: this.model,
        max_tokens: 4000, // Increased from 2000 to handle longer responses
        messages,
        temperature: 0.7, // Add some creativity
        timeout: 60000 // 60 second timeout
      }

      console.log('Request body:', JSON.stringify(requestBody, null, 2).substring(0, 500) + '...')

      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Claude API response status:', response.status, response.statusText)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Claude API error response:', errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        throw new Error(`Claude API error: ${errorData.error?.message || errorData.message || response.statusText}`)
      }

      const responseText = await response.text()
      console.log('Raw Claude response length:', responseText.length)
      console.log('Raw Claude response preview:', responseText.substring(0, 200) + '...')

      let data: ClaudeResponse
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse Claude response as JSON:', parseError)
        console.error('Raw response that failed to parse:', responseText)
        throw new Error(`Invalid JSON response from Claude API: ${parseError}`)
      }

      const content = data.content[0]?.text || ''
      console.log('Extracted content length:', content.length)
      
      return content
    } catch (error: any) {
      console.error('Claude API request failed:', error)
      throw new Error(`Failed to communicate with Claude: ${error.message}`)
    }
  }

  async analyzeSong(artist: string, title: string): Promise<Song['analysis']> {
    const prompt = `Analyze the song "${title}" by ${artist}. Provide a comprehensive analysis including:

1. Emotional tone and mood
2. Key themes and meaning
3. Musical characteristics (tempo, genre, era if known)
4. Key elements that make it distinctive
5. Cultural or historical context if relevant

Format your response as a detailed but concise analysis that would help a radio DJ understand what makes this song special and how it might connect with current topics or audience interests.

Respond in JSON format with the following structure:
{
  "emotional_tone": "string describing the overall emotional feeling",
  "themes": ["array", "of", "key", "themes"],
  "mood": "string describing the mood",
  "meaning": "string describing the song's meaning or message",
  "tempo": "string describing tempo (fast/medium/slow/etc)",
  "genre": "string describing the genre",
  "era": "string describing the time period or era",
  "key_elements": ["array", "of", "distinctive", "elements"]
}`

    const response = await this.makeRequest([
      { role: 'user', content: prompt }
    ])

    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse song analysis JSON:', error)
      // Fallback to basic analysis if JSON parsing fails
      return {
        emotional_tone: 'Unable to analyze',
        themes: ['General music'],
        mood: 'Unknown',
        meaning: 'Song analysis unavailable',
        tempo: 'Unknown',
        genre: 'Unknown',
        era: 'Unknown',
        key_elements: ['Musical composition']
      }
    }
  }

  async analyzeContent(contentSource: string, contentType: 'url' | 'upload' | 'manual'): Promise<ContentSession['content_analysis']> {
    const prompt = `Analyze the following content and provide a comprehensive analysis for a radio DJ who wants to connect it with song introductions:

Content Type: ${contentType}
Content: ${contentSource}

Provide an analysis that includes:
1. A concise summary of the main points
2. Key topics and themes
3. Emotional tone and style
4. Relevance score for radio content (1-10)
5. Potential connection points for music introductions

Focus on extracting information that would be useful for creating compelling song introductions that reference current events, trends, or interesting stories.

Respond in JSON format with the following structure:
{
  "summary": "concise summary of the content",
  "key_points": ["array", "of", "key", "points"],
  "tone": "emotional tone of the content",
  "topics": ["array", "of", "main", "topics"],
  "relevance_score": number_from_1_to_10
}`

    const response = await this.makeRequest([
      { role: 'user', content: prompt }
    ])

    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse content analysis JSON:', error)
      // Fallback analysis if JSON parsing fails
      return {
        summary: 'Content analysis unavailable',
        key_points: ['General content'],
        tone: 'Neutral',
        topics: ['General topic'],
        relevance_score: 5
      }
    }
  }

  async generateScripts(
    contentAnalysis: ContentSession['content_analysis'],
    songAnalysis: Song['analysis'],
    artist: string,
    songTitle: string,
    style: string
  ): Promise<{ shortScript: string; longScript: string; performanceNotes: { short: string; long: string } }> {
    const stylePrompts = {
      Humorous: "Create witty, entertaining scripts with clever observations and light humor. Keep it fun and engaging.",
      Casual: "Write conversational scripts that feel like talking to a friend. Use everyday language and relatable references.",
      Thoughtful: "Develop reflective scripts that connect deeper themes and meanings. Be insightful and contemplative.",
      Storytelling: "Craft narrative-driven scripts with engaging anecdotes and compelling story elements."
    }

    const stylePrompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.Casual

    const prompt = `You are a master radio DJ known for creating brilliant, unexpected connections between current events and music. Your specialty is finding the artful thread that ties seemingly unrelated content to songs in clever, entertaining ways that surprise and delight listeners.

CURRENT CONTENT TO CONNECT:
Summary: ${contentAnalysis?.summary || 'No content analysis available'}
Key Points: ${contentAnalysis?.key_points?.join(', ') || 'No key points'}
Main Topics: ${contentAnalysis?.topics?.join(', ') || 'No topics'}
Content Tone: ${contentAnalysis?.tone || 'Neutral'}

SONG TO INTRODUCE:
"${songTitle}" by ${artist}
Emotional Core: ${songAnalysis.emotional_tone}
Key Themes: ${songAnalysis.themes?.join(', ') || 'Universal human themes'}
Song Mood: ${songAnalysis.mood}
Song Meaning: ${songAnalysis.meaning}
Musical Style: ${songAnalysis.genre || 'Timeless'} from ${songAnalysis.era || 'the past'}

WRITING STYLE: ${stylePrompt}

YOUR MISSION: Create scripts that make an ARTFUL, UNEXPECTED CONNECTION between the content and the song. This is NOT about just introducing a song - it's about creating a "wow, I never would have thought to connect those two things" moment. Find the clever thread, the surprising parallel, the deeper human truth that links them.

CRITICAL REQUIREMENTS:
1. MUST directly reference and incorporate the actual content provided - don't just make generic statements
2. Find the unexpected connection - avoid obvious relationships
3. Create intrigue and "aha!" moments for listeners
4. SHORT SCRIPT (5-10 seconds, ~25-50 words): A sharp, clever connection
5. LONG SCRIPT (15-20 seconds, ~75-100 words): Build the connection with more detail and sophistication
6. Both scripts should feel like revelations, not just transitions
7. Use broadcast-appropriate language throughout

EXAMPLES of the style we want:
- Content about space exploration + Love song → "Speaking of exploring the unknown..."
- Story about AI advancement + Classic rock song → "Just like this next song predicted decades ago..."
- News about economic changes + Folk song → "Turns out some truths never change..."

Respond in JSON format:
{
  "shortScript": "5-10 second script with artful connection",
  "longScript": "15-20 second script with sophisticated connection",
  "performanceNotes": {
    "short": "performance guidance emphasizing the connection",
    "long": "performance guidance for building the revelation"
  }
}`

    const response = await this.makeRequest([
      { role: 'user', content: prompt }
    ])

    try {
      console.log('Parsing Claude response for script generation...')
      console.log('Response length:', response.length)
      console.log('Response preview:', response.substring(0, 300) + '...')
      
      // Check if response looks like it was truncated
      if (!response.includes('}') || response.endsWith('...')) {
        console.error('Claude response appears to be truncated:', response)
        throw new Error('Claude response was truncated or incomplete')
      }
      
      // Try to find and extract valid JSON if response has extra text
      let jsonResponse = response.trim()
      
      // If response has markdown formatting, try to extract JSON
      if (jsonResponse.includes('```json')) {
        const jsonStart = jsonResponse.indexOf('```json') + 7
        const jsonEnd = jsonResponse.indexOf('```', jsonStart)
        if (jsonEnd > jsonStart) {
          jsonResponse = jsonResponse.substring(jsonStart, jsonEnd).trim()
        }
      }
      
      // If response starts with ```json, remove it
      if (jsonResponse.startsWith('```json')) {
        jsonResponse = jsonResponse.substring(7).trim()
      }
      if (jsonResponse.endsWith('```')) {
        jsonResponse = jsonResponse.substring(0, jsonResponse.length - 3).trim()
      }
      
      const result = JSON.parse(jsonResponse)
      console.log('Script generation successful:', result)
      return result
    } catch (error) {
      console.error('Failed to parse script generation JSON:', error)
      console.error('Raw Claude response for debugging:', response)
      console.error('Content analysis that was sent:', contentAnalysis)
      console.error('Song analysis that was sent:', songAnalysis)
      
      // Create a more informative error message
      const errorDetails = {
        error: error instanceof Error ? error.message : 'Unknown parsing error',
        responseLength: response?.length || 0,
        responsePreview: response?.substring(0, 200) || 'No response',
        contentSummary: contentAnalysis?.summary || 'No content analysis',
        songTitle: songTitle,
        artist: artist
      }
      
      console.error('Detailed error info:', errorDetails)
      
      return {
        shortScript: `DEBUGGING: JSON parse failed. Error: ${errorDetails.error}. Response length: ${errorDetails.responseLength}`,
        longScript: `DEBUGGING: Claude returned invalid JSON. This may be due to response truncation, rate limiting, or prompt issues. Content: ${errorDetails.contentSummary} | Song: ${errorDetails.songTitle}`,
        performanceNotes: {
          short: 'Debug: Check server logs for detailed error info',
          long: 'Debug: JSON parsing failed - see console for full details'
        }
      }
    }
  }

  async checkContentCompliance(content: string): Promise<{ isCompliant: boolean; issues: string[] }> {
    // Basic content compliance for broadcast standards
    // Use word boundaries to avoid false positives (e.g., "assistant" containing "ass")
    const prohibited = [
      '\\bfuck\\b', '\\bshit\\b', '\\bdamn\\b', '\\bbitch\\b', 
      '\\bass\\b', '\\bbastard\\b', '\\bcrap\\b',
      'explicit', 'sexual', 'porn', 'nude', 'naked'
    ]
    
    const lowerContent = content.toLowerCase()
    const foundIssues = []
    
    for (const pattern of prohibited) {
      const regex = new RegExp(pattern, 'gi')
      if (regex.test(lowerContent)) {
        foundIssues.push(pattern.replace(/\\b/g, ''))
      }
    }
    
    if (foundIssues.length > 0) {
      return {
        isCompliant: false,
        issues: [`Contains prohibited language: ${foundIssues.join(', ')}`]
      }
    }
    
    // Most content passes - this is for music and entertainment news
    return {
      isCompliant: true,
      issues: []
    }
  }
}

export const claudeService = new ClaudeService()