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
    
    // Only validate API key on server side
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && this.apiKey === 'placeholder-key') {
      console.error('Missing CLAUDE_API_KEY in production environment')
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

    const prompt = `You are an expert radio DJ script writer. Create two song introduction scripts based on the following information:

CONTENT ANALYSIS:
Summary: ${contentAnalysis?.summary || 'No content analysis available'}
Key Points: ${contentAnalysis?.key_points?.join(', ') || 'No key points'}
Topics: ${contentAnalysis?.topics?.join(', ') || 'No topics'}
Tone: ${contentAnalysis?.tone || 'Neutral'}

SONG ANALYSIS:
Song: "${songTitle}" by ${artist}
Emotional Tone: ${songAnalysis.emotional_tone}
Themes: ${songAnalysis.themes?.join(', ') || 'No themes available'}
Mood: ${songAnalysis.mood}
Meaning: ${songAnalysis.meaning}
Genre: ${songAnalysis.genre || 'Unknown'}
Era: ${songAnalysis.era || 'Unknown'}

STYLE DIRECTION: ${stylePrompt}

REQUIREMENTS:
1. SHORT SCRIPT (5-10 seconds, ~25-50 words): Perfect for quick transitions
2. LONG SCRIPT (15-20 seconds, ~75-100 words): Build momentum and set the mood
3. Both scripts should connect the content with the song in a meaningful way
4. Maintain broadcast standards (FCC compliant)
5. Be authentic and engaging
6. Include performance notes for each script

Respond in JSON format:
{
  "shortScript": "5-10 second script text",
  "longScript": "15-20 second script text",
  "performanceNotes": {
    "short": "performance guidance for short script",
    "long": "performance guidance for long script"
  }
}`

    const response = await this.makeRequest([
      { role: 'user', content: prompt }
    ])

    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse script generation JSON:', error)
      // Fallback scripts if JSON parsing fails
      return {
        shortScript: `Here's "${songTitle}" by ${artist} - perfect for what's happening right now.`,
        longScript: `You know what's interesting about "${songTitle}" by ${artist}? It really captures the mood of what we're all talking about these days. This one's for everyone who gets it.`,
        performanceNotes: {
          short: 'Keep it punchy and confident',
          long: 'Build anticipation and connect with the audience'
        }
      }
    }
  }

  async checkContentCompliance(content: string): Promise<{ isCompliant: boolean; issues: string[] }> {
    const prompt = `Review the following content for FCC broadcast compliance and general appropriateness for radio:

Content: ${content}

Check for:
1. Profanity or inappropriate language
2. Sexually explicit content
3. Discriminatory language (racist, sexist, etc.)
4. Content that violates broadcast standards
5. Overly controversial political content
6. Content that might be considered offensive

Respond in JSON format:
{
  "isCompliant": boolean,
  "issues": ["array of specific issues found, if any"]
}`

    const response = await this.makeRequest([
      { role: 'user', content: prompt }
    ])

    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse compliance check JSON:', error)
      // Conservative fallback - assume non-compliant if we can't check
      return {
        isCompliant: false,
        issues: ['Unable to verify content compliance']
      }
    }
  }
}

export const claudeService = new ClaudeService()