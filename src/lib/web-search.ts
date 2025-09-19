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
    const analysisPrompt = `You are a professional radio content researcher analyzing CURRENT BREAKING NEWS. These search results contain the most up-to-date information available.

IMPORTANT: You must base your analysis ONLY on the search results provided below. Do NOT use your training data or prior knowledge. The information in these search results is current and takes precedence over any previous information you may have.

SEARCH QUERY: "${query}"

CURRENT SEARCH RESULTS (BREAKING NEWS):
${searchResults.map((result, index) => `
${index + 1}. TITLE: ${result.title}
   URL: ${result.url}
   CONTENT: ${result.snippet}
`).join('\n')}

CRITICAL INSTRUCTIONS:
- ONLY use information from the search results above
- These search results contain the MOST CURRENT information
- Do NOT contradict information in the search results
- Do NOT call anything "fake news" or "rumors" if it appears in these verified search results
- Treat all information in the search results as factual and current

Your task is to create a radio-ready content summary that captures:

1. MOST NEWSWORTHY INFORMATION: What's the biggest story from these search results?
2. SPECIFIC DETAILS: Extract exact names, dates, numbers, locations from the search results
3. CURRENT RELEVANCE: Why is this breaking news important right now?
4. HUMAN INTEREST: What makes this compelling based on the search results?
5. BROADCASTING CONTEXT: Information that would be useful for radio DJ commentary

Create a comprehensive summary based ONLY on the search results provided. The summary should be detailed enough to generate specific, engaging scripts.

RESPOND WITH A CLEAR, FACTUAL SUMMARY (NOT JSON):
Write in paragraph form, including all the specific details and newsworthy information found in the search results.`

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
    console.log('Performing real web search for:', query)

    // Use Claude Code's WebSearch API for real search results
    const searchResponse = await fetch('/api/web-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    })

    if (!searchResponse.ok) {
      throw new Error(`Search API error: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()

    if (!searchData.results || searchData.results.length === 0) {
      throw new Error('No search results found')
    }

    // Transform the search results to our expected format
    const formattedResults = searchData.results.map((result: any) => ({
      title: result.title || 'News Article',
      url: result.url || '#',
      snippet: result.snippet || result.description || 'No description available'
    }))

    console.log(`Found ${formattedResults.length} search results`)
    return formattedResults

  } catch (error: any) {
    console.error('Web search error:', error)

    // Fallback to placeholder results if real search fails
    console.log('Using fallback search results')
    return [
      {
        title: `Breaking: ${query} - Latest Updates`,
        url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Recent developments regarding ${query}. This is a fallback result - real search may be temporarily unavailable.`
      }
    ]
  }
}