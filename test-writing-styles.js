// Test the three different writing styles
async function testWritingStyles() {
  const testContent = {
    url: 'https://nypost.com/2025/09/15/real-estate/this-atlanta-suburb-was-ranked-americas-best-place-to-live/',
    artist: 'The Beatles',
    title: 'Here Comes The Sun'
  }

  const styles = ['Conversational', 'Humorous', 'Thoughtful']

  console.log('=== TESTING WRITING STYLES ===\n')
  console.log(`Content: ${testContent.url}`)
  console.log(`Song: ${testContent.artist} - ${testContent.title}\n`)

  for (const style of styles) {
    console.log(`--- ${style.toUpperCase()} STYLE ---`)
    
    try {
      const response = await fetch('https://introfuse.vercel.app/api/generate-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentSource: testContent.url,
          contentType: 'url',
          artist: testContent.artist,
          songTitle: testContent.title,
          selectedStyle: style,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`❌ ${style} failed:`, errorData.error)
        continue
      }

      const data = await response.json()
      
      console.log(`Short Script (${style}):`)
      console.log(`"${data.shortScript}"\n`)
      
      console.log(`Long Script (${style}):`)
      console.log(`"${data.longScript}"\n`)
      
      // Analyze the style characteristics
      const combinedText = `${data.shortScript} ${data.longScript}`.toLowerCase()
      
      console.log('Style Analysis:')
      
      if (style === 'Conversational') {
        const conversationalIndicators = ['you know', 'like', 'just', 'really', 'kind of']
        const found = conversationalIndicators.filter(indicator => combinedText.includes(indicator))
        console.log(`- Conversational tone: ${found.length > 0 ? '✅ ' + found.join(', ') : '⚪ None detected'}`)
      }
      
      if (style === 'Humorous') {
        const humorousIndicators = ['funny', 'ironic', 'turns out', 'who knew', 'plot twist']
        const found = humorousIndicators.filter(indicator => combinedText.includes(indicator))
        console.log(`- Humor elements: ${found.length > 0 ? '✅ ' + found.join(', ') : '⚪ None detected'}`)
      }
      
      if (style === 'Thoughtful') {
        const thoughtfulIndicators = ['reflects', 'deeper', 'reminds us', 'truth', 'human']
        const found = thoughtfulIndicators.filter(indicator => combinedText.includes(indicator))
        console.log(`- Thoughtful elements: ${found.length > 0 ? '✅ ' + found.join(', ') : '⚪ None detected'}`)
      }
      
      console.log(`- Length: ${data.shortScript.split(' ').length} / ${data.longScript.split(' ').length} words`)
      console.log('')
      
    } catch (error) {
      console.error(`Test failed for ${style}:`, error.message)
    }
  }

  console.log('=== STYLE COMPARISON COMPLETE ===')
}

// Wait for deployment then test
setTimeout(testWritingStyles, 60000) // 60 seconds
console.log('Waiting 60 seconds for deployment to propagate before testing styles...')