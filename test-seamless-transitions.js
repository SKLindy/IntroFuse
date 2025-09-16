// Test seamless content-song blending without basic transitions
async function testSeamlessTransitions() {
  const testCases = [
    {
      name: "NY Post Atlanta Suburb",
      url: 'https://nypost.com/2025/09/15/real-estate/this-atlanta-suburb-was-ranked-americas-best-place-to-live/',
      artist: 'Journey',
      title: 'Don\'t Stop Believin\''
    }
  ]

  for (const testCase of testCases) {
    console.log(`\n=== Testing Seamless Transitions: ${testCase.name} ===`)
    
    try {
      const response = await fetch('https://introfuse.vercel.app/api/generate-scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentSource: testCase.url,
          contentType: 'url',
          artist: testCase.artist,
          songTitle: testCase.title,
          selectedStyle: 'Casual',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error:', errorData)
        continue
      }

      const data = await response.json()
      
      console.log('Short Script:', data.shortScript)
      console.log('Long Script:', data.longScript)
      
      // Check for problematic basic transitions
      const combinedScripts = `${data.shortScript || ''} ${data.longScript || ''}`.toLowerCase()
      
      console.log('\n--- Transition Analysis ---')
      
      const basicTransitions = [
        'speaking of',
        'and speaking of',
        'here\'s a song about',
        'which brings us to',
        'that reminds me of',
        'here\'s',
        ', here\'s'
      ]
      
      const foundBasicTransitions = basicTransitions.filter(transition => 
        combinedScripts.includes(transition)
      )
      
      if (foundBasicTransitions.length > 0) {
        console.log('⚠️  Found basic transitions:', foundBasicTransitions)
        console.log('❌ NEEDS IMPROVEMENT: Scripts still use basic transitions')
      } else {
        console.log('✅ NO BASIC TRANSITIONS: Scripts use seamless blending')
      }
      
      // Check for seamless integration indicators
      const seamlessIndicators = [
        'just like',
        'while',
        'as',
        'turns out',
        'the same',
        'both'
      ]
      
      const foundSeamlessIndicators = seamlessIndicators.filter(indicator => 
        combinedScripts.includes(indicator)
      )
      
      if (foundSeamlessIndicators.length > 0) {
        console.log('✅ Found seamless indicators:', foundSeamlessIndicators)
      }
      
      // Check if it feels like one unified story
      const hasUnifiedFeel = !combinedScripts.includes('here\'s') && 
                           !combinedScripts.includes('speaking of') &&
                           (combinedScripts.includes('like') || combinedScripts.includes('while') || combinedScripts.includes('as'))
      
      if (hasUnifiedFeel) {
        console.log('✅ UNIFIED STORY: Content and song feel like one narrative')
      } else {
        console.log('⚠️  SEPARATED: Content and song feel like separate elements')
      }
      
    } catch (error) {
      console.error('Test failed:', error.message)
    }
  }
}

// Wait for deployment to propagate
setTimeout(testSeamlessTransitions, 45000) // 45 seconds
console.log('Waiting 45 seconds for deployment to propagate before testing...')