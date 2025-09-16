// Test enhanced content analysis and script specificity
async function testSpecificity() {
  const testCases = [
    {
      name: "NY Post - Atlanta Suburb",
      url: 'https://nypost.com/2025/09/15/real-estate/this-atlanta-suburb-was-ranked-americas-best-place-to-live/',
      artist: 'Adele',
      title: 'Rolling In The Deep',
      expectedDetails: ['Johns Creek', 'Georgia', 'Atlanta', '#1', 'ranked', 'best place']
    },
    {
      name: "CNN - Dwayne Johnson",
      url: 'https://www.cnn.com/2025/09/09/entertainment/dwayne-johnson-extreme-weight-loss',
      artist: 'Ed Sheeran',
      title: 'Perfect',
      expectedDetails: ['Dwayne Johnson', 'Rock', 'weight loss', 'Smashing Machine', 'role']
    }
  ]

  for (const testCase of testCases) {
    console.log(`\n=== Testing Specificity: ${testCase.name} ===`)
    
    try {
      const response = await fetch('https://introfuse.vercel.app/api/generate-scripts', {
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

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Error:', errorData)
        continue
      }

      const data = await response.json()
      
      console.log('Content Summary:', data.contentSummary)
      console.log('Short Script:', data.shortScript)
      console.log('Long Script:', data.longScript)
      
      // Check for specific details in content summary
      const summary = (data.contentSummary || '').toLowerCase()
      const summaryScore = testCase.expectedDetails.filter(detail => 
        summary.includes(detail.toLowerCase())
      ).length
      
      // Check for specific details in scripts
      const combinedScripts = `${data.shortScript || ''} ${data.longScript || ''}`.toLowerCase()
      const scriptScore = testCase.expectedDetails.filter(detail => 
        combinedScripts.includes(detail.toLowerCase())
      ).length
      
      console.log(`\n--- Specificity Analysis ---`)
      console.log(`Content Summary Specificity: ${summaryScore}/${testCase.expectedDetails.length} expected details found`)
      console.log(`Script Specificity: ${scriptScore}/${testCase.expectedDetails.length} expected details found`)
      
      if (summaryScore >= testCase.expectedDetails.length * 0.6) {
        console.log('✅ Content Summary: Good specificity')
      } else {
        console.log('⚠️  Content Summary: Needs more specific details')
      }
      
      if (scriptScore >= 2) {
        console.log('✅ Scripts: Good specificity')
      } else {
        console.log('⚠️  Scripts: Needs more specific details')
      }
      
      // Check for vague language that should be avoided
      const vagueTerms = ['transformation', 'changes', 'place was ranked', 'celebrity', 'someone']
      const vagueFound = vagueTerms.filter(term => combinedScripts.includes(term))
      
      if (vagueFound.length > 0) {
        console.log(`⚠️  Found vague language: ${vagueFound.join(', ')}`)
      } else {
        console.log('✅ No vague language detected')
      }
      
    } catch (error) {
      console.error('Test failed:', error.message)
    }
  }
}

testSpecificity()