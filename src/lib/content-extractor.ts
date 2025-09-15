import * as cheerio from 'cheerio'

export async function extractUrlContent(url: string): Promise<string> {
  try {
    console.log('Extracting content from URL:', url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1',
      },
    })

    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText)
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }

    const html = await response.text()
    console.log('HTML content length:', html.length)
    const $ = cheerio.load(html)

    // Remove script and style elements
    $('script, style, nav, header, footer, aside, .advertisement, .ads').remove()

    // Extract main content - try comprehensive content selectors
    let content = ''
    const contentSelectors = [
      // Standard semantic selectors
      'article',
      'main',
      '[role="main"]',
      
      // Common CMS patterns
      '.post-content',
      '.entry-content',
      '.article-content',
      '.story-content',
      '.content-body',
      '.article-body',
      '.post-body',
      
      // News site specific
      '.story-text',
      '.article-text',
      '.news-content',
      '.story-body',
      '.article-wrapper',
      '.content-wrapper',
      
      // Generic content containers
      '.content',
      '#content',
      '.main-content',
      '.primary-content',
      '.page-content',
      
      // WTOP and similar news sites
      '.single-post-content',
      '.entry-text',
      '.story-container',
      '.article-container',
      '.news-body',
      
      // Fallback patterns
      '.text-content',
      '.editorial-content',
      '.body-content',
      '[data-module="ArticleBody"]',
      '[data-component="article-body"]'
    ]

    console.log('Trying content selectors...')
    for (const selector of contentSelectors) {
      const element = $(selector).first()
      if (element.length) {
        const text = element.text().trim()
        console.log(`Selector "${selector}": found ${text.length} characters`)
        if (text.length > 100) {
          content = text
          console.log(`Using content from selector: ${selector}`)
          break
        }
      }
    }

    // Enhanced fallback strategies if no main content found
    if (!content) {
      console.log('No content found with main selectors, trying fallback strategies...')
      
      // Try paragraph-based extraction
      const paragraphs = $('p').map((i, el) => $(el).text().trim()).get()
      const longParagraphs = paragraphs.filter(p => p.length > 50)
      if (longParagraphs.length >= 3) {
        content = longParagraphs.join(' ')
        console.log(`Using paragraph extraction: ${longParagraphs.length} paragraphs`)
      }
      
      // Try div-based extraction with content heuristics
      if (!content) {
        $('div').each((i, el) => {
          const divText = $(el).text().trim()
          if (divText.length > 300 && divText.length < 5000) {
            // Check if it looks like article content (not navigation/ads)
            const sentences = divText.split('.').length
            const words = divText.split(' ').length
            if (sentences > 5 && words > 50) {
              content = divText
              console.log(`Using div content heuristic: ${words} words, ${sentences} sentences`)
              return false // break out of each loop
            }
          }
        })
      }
      
      // Last resort: body content filtered
      if (!content) {
        const bodyText = $('body').text()
        content = bodyText
        console.log('Using filtered body content as last resort')
      }
    }

    // Clean up whitespace and remove common noise
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .replace(/Share\s+Tweet\s+Email/gi, '') // Social sharing buttons
      .replace(/Advertisement/gi, '') // Ad markers
      .replace(/Subscribe\s+to/gi, '') // Subscription prompts
      .replace(/Read\s+more/gi, '') // Read more links
      .trim()

    console.log('Extracted content length after cleaning:', content.length)
    console.log('First 300 characters:', content.substring(0, 300))

    // Limit content length to prevent API overload
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...'
    }

    // More lenient content validation
    if (!content || content.length < 30) {
      console.error('Content too short or empty:', content.length, 'characters')
      console.error('Raw content preview:', content)
      throw new Error(`Unable to extract meaningful content from URL. Content length: ${content.length}`)
    }

    // Check for common "no content" indicators
    const noContentIndicators = [
      '404', 'not found', 'page not found', 'access denied', 
      'subscription required', 'login required', 'content not available'
    ]
    
    const lowerContent = content.toLowerCase()
    const hasNoContentIndicator = noContentIndicators.some(indicator => 
      lowerContent.includes(indicator)
    )
    
    if (hasNoContentIndicator) {
      console.warn('Content appears to indicate no access or missing page')
      throw new Error('Content appears to be inaccessible (404, paywall, or access denied)')
    }

    console.log('Final content length:', content.length)
    return content
  } catch (error: any) {
    console.error('URL content extraction failed:', error)
    throw new Error(`Failed to extract content from URL: ${error.message}`)
  }
}

export async function extractPdfContent(file: File): Promise<string> {
  // TODO: Implement PDF content extraction
  // For now, return a placeholder
  throw new Error('PDF extraction not yet implemented')
}

export async function extractDocContent(file: File): Promise<string> {
  // TODO: Implement DOC/DOCX content extraction
  // For now, return a placeholder
  throw new Error('Document extraction not yet implemented')
}