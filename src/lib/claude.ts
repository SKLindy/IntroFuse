import { Song, ContentSession } from '@/types/database'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL_SONNET = 'claude-3-5-sonnet-20241022'
const MODEL_OPUS = 'claude-3-5-sonnet-20241022'

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
    this.model = MODEL_SONNET // Default to Sonnet
    
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

  setModel(model: 'sonnet' | 'opus') {
    this.model = model === 'opus' ? MODEL_OPUS : MODEL_SONNET
  }

  private async makeRequest(messages: ClaudeMessage[]): Promise<string> {
    if (!this.apiKey || this.apiKey === 'placeholder-key') {
      throw new Error('Claude API key not configured')
    }

    try {
      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 2000,
          messages,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Claude API error: ${errorData.error?.message || response.statusText}`)
      }

      const data: ClaudeResponse = await response.json()
      return data.content[0]?.text || ''
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
      const result = JSON.parse(response)
      console.log('Script generation successful:', result)
      return result
    } catch (error) {
      console.error('Failed to parse script generation JSON:', error)
      console.error('Raw Claude response:', response)
      
      // If JSON fails, but we have a response, try to extract content manually
      if (response && response.length > 50) {
        return {
          shortScript: `DEBUGGING: Content was provided but script generation failed. Raw response: ${response.substring(0, 100)}...`,
          longScript: `DEBUGGING: This indicates a JSON parsing issue. Content: ${contentAnalysis?.summary || 'No summary'} | Song: ${songTitle}`,
          performanceNotes: {
            short: 'Debug mode - check logs',
            long: 'Debug mode - JSON parsing failed'
          }
        }
      }
      
      // Complete failure fallback
      return {
        shortScript: `ERROR: Script generation completely failed for "${songTitle}" by ${artist}`,
        longScript: `ERROR: No connection could be made between the content about "${contentAnalysis?.summary || 'unknown topic'}" and this song.`,
        performanceNotes: {
          short: 'Error state',
          long: 'Error state'
        }
      }
    }
  }

  async checkContentCompliance(content: string): Promise<{ isCompliant: boolean; issues: string[] }> {
    // For now, allow most content to pass through for testing
    // Basic checks only - no profanity, no explicit content
    const prohibited = [
      'fuck', 'shit', 'damn', 'bitch', 'ass', 'bastard', 'crap',
      'explicit', 'sexual', 'porn', 'nude', 'naked'
    ]
    
    const lowerContent = content.toLowerCase()
    const foundIssues = prohibited.filter(word => lowerContent.includes(word))
    
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