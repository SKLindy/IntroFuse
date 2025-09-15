// Test specific problematic URLs through the full pipeline
async function testProblematicUrls() {
  const testCases = [
    {
      url: 'https://www.cnn.com/2025/09/09/entertainment/dwayne-johnson-extreme-weight-loss',
      artist: 'Tom Petty',
      title: 'Free Fallin\''
    },
    {
      url: 'https://nypost.com/2025/09/15/real-estate/this-atlanta-suburb-was-ranked-americas-best-place-to-live/',
      artist: 'The Weeknd', 
      title: 'Blinding Lights'
    }
  ]

  for (const testCase of testCases) {
    console.log(`\n=== Testing URL: ${testCase.url} ===`)
    
    // First test URL extraction
    try {
      const extractResponse = await fetch('https://introfuse.vercel.app/api/extract-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: testCase.url }),
      })

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json()
        console.error('URL extraction error:', errorData)
        continue
      }

      const extractData = await extractResponse.json()
      console.log('✅ URL extraction successful')
      console.log('Content length:', extractData.content.length)
      console.log('First 200 characters:', extractData.content.substring(0, 200))
      
      // Now test the full script generation pipeline
      console.log('\n--- Testing full script generation pipeline ---')
      
      const scriptResponse = await fetch('https://introfuse.vercel.app/api/generate-scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentSource: testCase.url,
          contentType: 'url',
          artist: testCase.artist,
          songTitle: testCase.title,
          selectedStyle: 'Casual',
        }),
      })

      if (!scriptResponse.ok) {
        const errorData = await scriptResponse.json()
        console.error('❌ Script generation error:', errorData)
        continue
      }

      const scriptData = await scriptResponse.json()
      console.log('✅ Script generation successful')
      console.log('Short Script:', scriptData.shortScript)
      console.log('Content Summary:', scriptData.contentSummary)
      
      // Analyze if the script references the actual content
      const shortScript = scriptData.shortScript || ''
      const summary = scriptData.contentSummary || ''
      
      if (testCase.url.includes('dwayne-johnson')) {
        const referencesContent = shortScript.toLowerCase().includes('dwayne') || 
                                shortScript.toLowerCase().includes('johnson') || 
                                shortScript.toLowerCase().includes('rock') ||
                                shortScript.toLowerCase().includes('weight') ||
                                summary.toLowerCase().includes('dwayne')
        console.log('References Dwayne Johnson content:', referencesContent)
      }
      
      if (testCase.url.includes('atlanta-suburb')) {
        const referencesContent = shortScript.toLowerCase().includes('atlanta') || 
                                shortScript.toLowerCase().includes('suburb') || 
                                shortScript.toLowerCase().includes('georgia') ||
                                shortScript.toLowerCase().includes('johns creek') ||
                                summary.toLowerCase().includes('atlanta')
        console.log('References Atlanta suburb content:', referencesContent)
      }
      
    } catch (error) {
      console.error('Test failed for', testCase.url, ':', error.message)
    }
  }
}

testProblematicUrls()