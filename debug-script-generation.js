// Debug script for testing Claude API directly
require('dotenv').config({ path: '.env.local' })

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL_SONNET = 'claude-3-5-sonnet-20241022'

async function testClaudeAPI() {
  const apiKey = process.env.CLAUDE_API_KEY
  
  if (!apiKey || apiKey === 'your_actual_claude_key_here') {
    console.error('CLAUDE_API_KEY not configured properly in .env.local')
    console.log('Please set a real Claude API key in .env.local')
    console.log('For now, testing will use production deployment...')
    return testWithProduction()
  }

  // Test content analysis first
  const testContent = "Scientists have discovered a new exoplanet that's remarkably similar to Earth, located just 22 light-years away. The planet, called TOI-715 b, orbits within the habitable zone of its red dwarf star and could potentially support liquid water on its surface."
  
  const analysisPrompt = `Analyze the following content and provide a comprehensive analysis for a radio DJ who wants to connect it with song introductions:

Content Type: manual
Content: ${testContent}

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

  try {
    console.log('Testing content analysis...')
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL_SONNET,
        max_tokens: 2000,
        messages: [{ role: 'user', content: analysisPrompt }],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Claude API error:', errorData)
      return
    }

    const data = await response.json()
    const analysisText = data.content[0]?.text || ''
    console.log('Raw Claude response for analysis:', analysisText)
    
    let contentAnalysis
    try {
      contentAnalysis = JSON.parse(analysisText)
      console.log('Parsed content analysis:', contentAnalysis)
    } catch (error) {
      console.error('Failed to parse analysis JSON:', error)
      return
    }

    // Now test script generation
    const mockSongAnalysis = {
      emotional_tone: "Dreamy and hopeful",
      themes: ["love", "possibility", "adventure"],
      mood: "Romantic and optimistic", 
      meaning: "A song about taking chances on love despite uncertainty",
      tempo: "Medium",
      genre: "Pop country",
      era: "2000s",
      key_elements: ["Storytelling lyrics", "Relatable narrative", "Universal themes"]
    }

    const scriptPrompt = `You are a master radio DJ known for creating brilliant, unexpected connections between current events and music. Your specialty is finding the artful thread that ties seemingly unrelated content to songs in clever, entertaining ways that surprise and delight listeners.

CURRENT CONTENT TO CONNECT:
Summary: ${contentAnalysis.summary}
Key Points: ${contentAnalysis.key_points.join(', ')}
Main Topics: ${contentAnalysis.topics.join(', ')}
Content Tone: ${contentAnalysis.tone}

SONG TO INTRODUCE:
"Love Story" by Taylor Swift
Emotional Core: ${mockSongAnalysis.emotional_tone}
Key Themes: ${mockSongAnalysis.themes.join(', ')}
Song Mood: ${mockSongAnalysis.mood}
Song Meaning: ${mockSongAnalysis.meaning}
Musical Style: ${mockSongAnalysis.genre} from ${mockSongAnalysis.era}

WRITING STYLE: Write conversational scripts that feel like talking to a friend. Use everyday language and relatable references.

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

    console.log('\nTesting script generation...')
    const scriptResponse = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL_SONNET,
        max_tokens: 2000,
        messages: [{ role: 'user', content: scriptPrompt }],
      }),
    })

    if (!scriptResponse.ok) {
      const errorData = await scriptResponse.json()
      console.error('Script generation error:', errorData)
      return
    }

    const scriptData = await scriptResponse.json()
    const scriptText = scriptData.content[0]?.text || ''
    console.log('\nRaw Claude response for scripts:', scriptText)
    
    try {
      const scripts = JSON.parse(scriptText)
      console.log('\nParsed scripts:', scripts)
    } catch (error) {
      console.error('Failed to parse script JSON:', error)
    }

  } catch (error) {
    console.error('Test failed:', error)
  }
}

async function testWithProduction() {
  console.log('Testing with local development server...')
  
  const testContent = "Scientists have discovered a new exoplanet that's remarkably similar to Earth, located just 22 light-years away. The planet, called TOI-715 b, orbits within the habitable zone of its red dwarf star and could potentially support liquid water on its surface."
  
  try {
    const response = await fetch('http://localhost:3000/api/generate-scripts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentSource: testContent,
        contentType: 'manual',
        artist: 'Taylor Swift',
        songTitle: 'Love Story',
        selectedStyle: 'Casual',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Production API error:', errorData)
      return
    }

    const data = await response.json()
    console.log('Local server response:', JSON.stringify(data, null, 2))
    
    // Check if the scripts actually reference the content
    const shortScript = data.shortScript || ''
    const longScript = data.longScript || ''
    
    console.log('\n--- ANALYSIS ---')
    console.log('Content mentions exoplanet:', shortScript.toLowerCase().includes('exoplanet') || longScript.toLowerCase().includes('exoplanet'))
    console.log('Content mentions Earth:', shortScript.toLowerCase().includes('earth') || longScript.toLowerCase().includes('earth'))
    console.log('Content mentions space/planet:', shortScript.toLowerCase().includes('space') || shortScript.toLowerCase().includes('planet') || longScript.toLowerCase().includes('space') || longScript.toLowerCase().includes('planet'))
    console.log('Content mentions distance/light-years:', shortScript.toLowerCase().includes('light') || shortScript.toLowerCase().includes('distance') || longScript.toLowerCase().includes('light') || longScript.toLowerCase().includes('distance'))
    
    if (shortScript.toLowerCase().includes('perfect for what\'s happening') || shortScript.toLowerCase().includes('captures the mood')) {
      console.log('⚠️  GENERIC SCRIPT DETECTED - Not using actual content')
    } else {
      console.log('✅ Script appears to use specific content')
    }

  } catch (error) {
    console.error('Production test failed:', error)
  }
}

testClaudeAPI()