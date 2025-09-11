import * as cheerio from 'cheerio'

export async function extractUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IntroFuse/1.0; +https://introfuse.com)',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Remove script and style elements
    $('script, style, nav, header, footer, aside, .advertisement, .ads').remove()

    // Extract main content - try common content selectors
    let content = ''
    const contentSelectors = [
      'article',
      '.content',
      '.post-content',
      '.entry-content',
      '#content',
      'main',
      '.main-content'
    ]

    for (const selector of contentSelectors) {
      const element = $(selector).first()
      if (element.length && element.text().trim().length > 100) {
        content = element.text()
        break
      }
    }

    // Fallback to body content if no main content found
    if (!content) {
      content = $('body').text()
    }

    // Clean up whitespace
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim()

    // Limit content length to prevent API overload
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...'
    }

    if (!content || content.length < 50) {
      throw new Error('Unable to extract meaningful content from URL')
    }

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