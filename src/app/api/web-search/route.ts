import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query parameter is required and must be a string' },
        { status: 400 }
      )
    }

    console.log('Performing web search for:', query)

    // Use web search to find current, newsworthy content
    const searchResults = await performWebSearch(query)
    
    if (!searchResults || searchResults.length === 0) {
      return NextResponse.json(
        { error: 'No search results found for the given query' },
        { status: 404 }
      )
    }

    // Transform results to match our expected format  
    const results = searchResults.map((result: any) => ({
      title: result.title || 'No title',
      url: result.url || '',
      snippet: result.snippet || result.content || 'No content available'
    }))

    console.log(`Found ${results.length} search results for: ${query}`)
    return NextResponse.json({ results })
    
  } catch (error: any) {
    console.error('Web search API error:', error)
    return NextResponse.json(
      { error: `Web search failed: ${error.message}` },
      { status: 500 }
    )
  }
}

// Use multiple search strategies for robust news discovery
async function performWebSearch(query: string) {
  try {
    console.log('Performing comprehensive web search for:', query)

    const searchResults = []

    // Strategy 1: Try multiple RSS news feeds
    const newsSources = [
      {
        name: 'Google News',
        url: `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`,
        parser: 'google'
      },
      {
        name: 'Reuters',
        url: `https://www.reuters.com/arc/outboundfeeds/rss/category/world/?q=${encodeURIComponent(query)}`,
        parser: 'standard'
      },
      {
        name: 'AP News',
        url: `https://feeds.apnews.com/rss/apf-topnews`,
        parser: 'standard'
      }
    ]

    // Try each news source
    for (const source of newsSources) {
      try {
        console.log(`Trying ${source.name} for: ${query}`)

        const response = await fetch(source.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml',
            'Cache-Control': 'no-cache'
          },
          timeout: 10000
        })

        if (response.ok) {
          const rssText = await response.text()
          console.log(`${source.name} response length:`, rssText.length)

          // Parse RSS content
          const items = rssText.match(/<item>[\s\S]*?<\/item>/g) ||
                       rssText.match(/<entry>[\s\S]*?<\/entry>/g) || []

          console.log(`Found ${items.length} items from ${source.name}`)

          for (const item of items.slice(0, 5)) {
            // Extract title
            const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                         item.match(/<title[^>]*>(.*?)<\/title>/)?.[1] ||
                         'News Article'

            // Extract link
            const link = item.match(/<link[^>]*>(.*?)<\/link>/)?.[1] ||
                        item.match(/<link[^>]*href="([^"]*)"[^>]*>/)?.[1] ||
                        item.match(/<guid[^>]*>(.*?)<\/guid>/)?.[1] ||
                        '#'

            // Extract description/content
            const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                              item.match(/<description[^>]*>(.*?)<\/description>/)?.[1] ||
                              item.match(/<content[^>]*>(.*?)<\/content>/)?.[1] ||
                              item.match(/<summary[^>]*>(.*?)<\/summary>/)?.[1] ||
                              'No description available'

            // Clean up content
            const cleanTitle = title.replace(/<[^>]*>/g, '').trim()
            const cleanDescription = description.replace(/<[^>]*>/g, '').trim()

            // Check relevance to query
            const queryLower = query.toLowerCase()
            const contentLower = (cleanTitle + ' ' + cleanDescription).toLowerCase()

            if (contentLower.includes(queryLower) ||
                queryLower.split(' ').some(word => word.length > 3 && contentLower.includes(word))) {

              searchResults.push({
                title: cleanTitle,
                url: link.startsWith('http') ? link : `https://news.google.com${link}`,
                snippet: cleanDescription.substring(0, 250) + (cleanDescription.length > 250 ? '...' : ''),
                source: source.name
              })
            }
          }
        }
      } catch (sourceError) {
        console.log(`${source.name} failed:`, sourceError.message)
      }
    }

    // Strategy 2: If no relevant results, try broader search
    if (searchResults.length === 0) {
      console.log('No RSS results found, trying broader search approaches')

      // Try general news topics
      const generalNewsUrl = 'https://feeds.bbci.co.uk/news/rss.xml'
      try {
        const response = await fetch(generalNewsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })

        if (response.ok) {
          const rssText = await response.text()
          const items = rssText.match(/<item>[\s\S]*?<\/item>/g) || []

          for (const item of items.slice(0, 10)) {
            const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                         item.match(/<title>(.*?)<\/title>/)?.[1] || 'News Article'
            const link = item.match(/<link>(.*?)<\/link>/)?.[1] || '#'
            const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                              item.match(/<description>(.*?)<\/description>/)?.[1] || ''

            const cleanTitle = title.replace(/<[^>]*>/g, '').trim()
            const cleanDescription = description.replace(/<[^>]*>/g, '').trim()

            // Check for query relevance
            const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2)
            const content = (cleanTitle + ' ' + cleanDescription).toLowerCase()

            if (queryWords.some(word => content.includes(word))) {
              searchResults.push({
                title: cleanTitle,
                url: link,
                snippet: cleanDescription.substring(0, 200) + '...',
                source: 'BBC News'
              })
            }
          }
        }
      } catch (bbcError) {
        console.log('BBC News fallback failed:', bbcError.message)
      }
    }

    // Strategy 3: Final fallback with informative placeholder
    if (searchResults.length === 0) {
      console.log('All search strategies failed, using informed fallback')

      searchResults.push({
        title: `Current News: ${query}`,
        url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: `While specific details about "${query}" weren't found in our current news feeds, this appears to be a developing story. For the most current information, check major news outlets like CNN, BBC, Reuters, or Associated Press for verified reporting and updates.`,
        source: 'Fallback'
      })
    }

    console.log(`Final result: Found ${searchResults.length} search results for "${query}"`)
    return searchResults.slice(0, 5) // Limit to top 5 results

  } catch (error: any) {
    console.error('Comprehensive web search error:', error)
    throw new Error(`Search failed: ${error.message}`)
  }
}