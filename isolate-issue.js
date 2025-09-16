// Isolate exactly where the content specificity is being lost
async function isolateIssue() {
  const testUrl = 'https://nypost.com/2025/09/15/real-estate/this-atlanta-suburb-was-ranked-americas-best-place-to-live/'
  
  console.log('=== ISOLATING THE CONTENT SPECIFICITY ISSUE ===\n')
  
  try {
    // Test content analysis directly
    console.log('--- Testing Content Analysis Step ---')
    
    // First get the raw extracted content
    const extractResponse = await fetch('https://introfuse.vercel.app/api/extract-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl })
    })
    
    const extractData = await extractResponse.json()
    const rawContent = extractData.content
    
    console.log('Raw content contains Johns Creek:', rawContent.toLowerCase().includes('johns creek'))
    console.log('Raw content contains Architectural Digest:', rawContent.toLowerCase().includes('architectural digest'))
    
    // Now test what the content analysis produces
    // We need to simulate what the generate-scripts API does internally
    
    console.log('\n--- Simulating Full Pipeline ---')
    
    const fullResponse = await fetch('https://introfuse.vercel.app/api/generate-scripts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({
        contentSource: testUrl,
        contentType: 'url',
        artist: 'Test Artist',
        songTitle: 'Test Song',
        selectedStyle: 'Casual',
      }),
    })
    
    if (!fullResponse.ok) {
      const errorData = await fullResponse.json()
      console.log('❌ Pipeline failed:', errorData)
      return
    }
    
    const fullData = await fullResponse.json()
    
    console.log('\n--- Analysis Results ---')
    console.log('Content Summary Length:', (fullData.contentSummary || '').length)
    console.log('Content Summary:', fullData.contentSummary)
    
    console.log('\n--- Script Results ---')  
    console.log('Short Script:', fullData.shortScript)
    console.log('Long Script:', fullData.longScript)
    
    // Check what actually made it through
    const allContent = `${fullData.contentSummary || ''} ${fullData.shortScript || ''} ${fullData.longScript || ''}`.toLowerCase()
    
    console.log('\n--- Specificity Check ---')
    console.log('Final output contains Johns Creek:', allContent.includes('johns creek'))
    console.log('Final output contains Architectural Digest:', allContent.includes('architectural digest'))
    console.log('Final output contains Georgia:', allContent.includes('georgia'))
    console.log('Final output contains specific numbers:', /\d+/.test(allContent))
    
    // Check for problem patterns
    console.log('\n--- Problem Pattern Check ---')
    console.log('Contains "blank page":', allContent.includes('blank page'))
    console.log('Contains "no content":', allContent.includes('no content'))
    console.log('Contains "feeling when":', allContent.includes('feeling when'))
    console.log('Contains "searching for":', allContent.includes('searching for'))
    console.log('Contains generic language:', allContent.includes('perfect place') || allContent.includes('hot market'))
    
    if (allContent.includes('johns creek') && allContent.includes('architectural digest')) {
      console.log('\n✅ SUCCESS: Enhanced specificity is working!')
    } else {
      console.log('\n❌ ISSUE: Content specificity is being lost somewhere in the pipeline')
    }
    
  } catch (error) {
    console.error('Isolation test failed:', error.message)
  }
}

isolateIssue()