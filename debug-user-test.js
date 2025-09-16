// Test the exact same requests the user made
async function debugUserTest() {
  const tests = [
    {
      url: 'https://nypost.com/2025/09/15/real-estate/this-atlanta-suburb-was-ranked-americas-best-place-to-live/',
      artist: 'Natalie Imbriglia',
      title: 'Torn'
    },
    {
      url: 'https://www.cnn.com/2025/09/09/entertainment/dwayne-johnson-extreme-weight-loss',
      artist: 'Gotye',
      title: 'Somebody That I used To Know'
    }
  ]

  for (const test of tests) {
    console.log(`\n=== Testing: ${test.artist} - ${test.title} ===`)
    console.log(`URL: ${test.url}`)
    
    try {
      // First check URL extraction directly
      console.log('\n--- Testing URL Extraction ---')
      const extractResponse = await fetch('https://introfuse.vercel.app/api/extract-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: test.url }),
      })

      if (extractResponse.ok) {
        const extractData = await extractResponse.json()
        console.log('✅ URL extraction successful')
        console.log('Content length:', extractData.content.length)
        console.log('First 200 chars:', extractData.content.substring(0, 200))
      } else {
        console.log('❌ URL extraction failed')
        const errorData = await extractResponse.json()
        console.log('Error:', errorData)
      }

      // Now test full script generation
      console.log('\n--- Testing Script Generation ---')
      const scriptResponse = await fetch('https://introfuse.vercel.app/api/generate-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentSource: test.url,
          contentType: 'url',
          artist: test.artist,
          songTitle: test.title,
          selectedStyle: 'Casual',
        }),
      })

      if (scriptResponse.ok) {
        const scriptData = await scriptResponse.json()
        console.log('✅ Script generation successful')
        console.log('Content Summary:', scriptData.contentSummary)
        console.log('Short Script:', scriptData.shortScript)
        console.log('Long Script:', scriptData.longScript)
        
        // Check what's actually happening
        const scripts = `${scriptData.shortScript} ${scriptData.longScript}`.toLowerCase()
        if (scripts.includes('future') || scripts.includes('2025') || scripts.includes('no content')) {
          console.log('⚠️  ISSUE: Getting "no content" or "future" scripts')
        } else {
          console.log('✅ Getting real content-based scripts')
        }
      } else {
        console.log('❌ Script generation failed')
        const errorData = await scriptResponse.json()
        console.log('Error:', errorData)
      }
      
    } catch (error) {
      console.error('Test failed:', error.message)
    }
  }
}

debugUserTest()