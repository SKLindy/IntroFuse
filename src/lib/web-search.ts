import { claudeService } from './claude'

export async function performWebSearch(query: string): Promise<string> {
  try {
    console.log('Performing web search for:', query)
    
    // Use the WebSearch tool to find current content
    const searchResults = await searchWeb(query)
    
    if (!searchResults || searchResults.length === 0) {
      throw new Error('No search results found for the given query')
    }
    
    // Create a comprehensive prompt for Claude to analyze and summarize search results
    const analysisPrompt = `You are a professional radio content researcher. Analyze these web search results and create a comprehensive summary for radio DJ script generation.

SEARCH QUERY: "${query}"

SEARCH RESULTS:
${searchResults.map((result, index) => `
${index + 1}. TITLE: ${result.title}
   URL: ${result.url}
   CONTENT: ${result.snippet}
`).join('\n')}

Your task is to create a radio-ready content summary that captures:

1. MOST NEWSWORTHY INFORMATION: What's the biggest story or most interesting development?
2. SPECIFIC DETAILS: Names, dates, numbers, locations - concrete facts that make the story identifiable
3. CURRENT RELEVANCE: Why is this trending or important right now?
4. HUMAN INTEREST: What makes this compelling or relatable to radio audiences?
5. BROADCASTING CONTEXT: Information that would be useful for radio DJ commentary

CRITICAL REQUIREMENTS:
- Focus on the most recent and newsworthy developments
- Include specific facts, names, numbers, dates that make the content identifiable
- Prioritize information that would be interesting to a general radio audience
- Combine insights from multiple sources when they complement each other
- Ignore outdated or irrelevant results

Create a comprehensive summary that a radio DJ could use to create compelling song introductions. The summary should be detailed enough to generate specific, engaging scripts.

RESPOND WITH A CLEAR, FACTUAL SUMMARY (NOT JSON):
Write in paragraph form, including all the specific details and newsworthy information you found.`

    // Use Claude to analyze and summarize the search results
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: analysisPrompt }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Claude API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const summary = data.content[0]?.text || 'No summary available'
    
    console.log('Web search summary generated, length:', summary.length)
    return summary
    
  } catch (error: any) {
    console.error('Web search failed:', error)
    throw new Error(`Web search failed: ${error.message}`)
  }
}

async function searchWeb(query: string): Promise<Array<{title: string, url: string, snippet: string}>> {
  try {
    // Use the WebSearch tool to get real search results
    const response = await fetch('/api/web-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })
    
    if (!response.ok) {
      throw new Error(`Web search API failed: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.results || []
    
  } catch (error: any) {
    console.error('Web search request failed:', error)
    throw new Error(`Failed to perform web search: ${error.message}`)
  }
}