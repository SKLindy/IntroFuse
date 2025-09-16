// Test the real web search functionality with Robert Redford query
async function testRealSearch() {
  console.log('=== TESTING REAL WEB SEARCH FUNCTIONALITY ===\n')
  
  const testQueries = [
    'Robert Redford dies',
    'robert redford death',
    'latest AI breakthrough',
    'trending news today'
  ]

  for (const query of testQueries) {
    console.log(`Testing search query: "${query}"`)
    
    try {
      const response = await fetch('http://localhost:3000/api/generate-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentSource: query,
          contentType: 'search',
          artist: 'Lee Brice',
          songTitle: 'A Woman Like You',
          selectedStyle: 'Conversational',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`❌ Search failed for "${query}":`, errorData.error)
        continue
      }

      const data = await response.json()
      console.log(`✅ Search successful for "${query}"`)
      console.log('Short script preview:', data.shortScript?.substring(0, 200) + '...')
      console.log('Long script preview:', data.longScript?.substring(0, 200) + '...')
      console.log('')
      
    } catch (error) {
      console.error(`❌ Test failed for "${query}":`, error.message)
    }
  }

  console.log('=== REAL WEB SEARCH TEST COMPLETE ===')
}

// Wait for server to be ready then test
setTimeout(testRealSearch, 3000)
console.log('Waiting 3 seconds for server to be ready before testing real search...')