// Test the web search functionality
async function testWebSearch() {
  console.log('=== TESTING WEB SEARCH FUNCTIONALITY ===\n')
  
  const testQuery = 'robert redford'
  console.log(`Testing search query: "${testQuery}"`)
  
  try {
    // Test the web search API endpoint
    console.log('Testing /api/web-search endpoint...')
    const searchResponse = await fetch('http://localhost:3000/api/web-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: testQuery }),
    })

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json()
      console.error('❌ Web search API failed:', errorData.error)
      return
    }

    const searchData = await searchResponse.json()
    console.log('✅ Web search API successful')
    console.log(`Found ${searchData.results.length} results:`)
    searchData.results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.title}`)
      console.log(`     URL: ${result.url}`)
      console.log(`     Snippet: ${result.snippet.substring(0, 100)}...`)
    })
    console.log('')

    // Test the web search + summary functionality
    console.log('Testing web search + summary via performWebSearch...')
    const summaryResponse = await fetch('http://localhost:3000/api/generate-scripts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentSource: testQuery,
        contentType: 'search',
        artist: 'The Beatles',
        songTitle: 'Here Comes The Sun',
        selectedStyle: 'Conversational',
      }),
    })

    if (!summaryResponse.ok) {
      const errorData = await summaryResponse.json()
      console.log(`⚠️  Script generation with search failed: ${errorData.error}`)
      console.log('This is expected if Claude API key is not configured')
    } else {
      const summaryData = await summaryResponse.json()
      console.log('✅ Complete web search to script generation successful!')
      console.log('Short script:', summaryData.shortScript)
      console.log('Long script:', summaryData.longScript)
    }

  } catch (error) {
    console.error('Test failed:', error.message)
  }

  console.log('\n=== WEB SEARCH TEST COMPLETE ===')
}

// Wait for server to be ready then test
setTimeout(testWebSearch, 3000)
console.log('Waiting 3 seconds for server to be ready...')