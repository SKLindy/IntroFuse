// Deep debug of the entire pipeline to see where it's breaking
async function deepDebugPipeline() {
  const testUrl = 'https://nypost.com/2025/09/15/real-estate/this-atlanta-suburb-was-ranked-americas-best-place-to-live/'
  const artist = 'The Police'
  const title = 'Every Breath You Take'
  
  console.log('=== DEEP PIPELINE DEBUG ===')
  console.log(`URL: ${testUrl}`)
  console.log(`Artist: ${artist}`)
  console.log(`Title: ${title}`)
  
  try {
    // Step 1: Test URL extraction in detail
    console.log('\n--- STEP 1: URL EXTRACTION ---')
    const extractResponse = await fetch('https://introfuse.vercel.app/api/extract-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: testUrl }),
    })

    let extractedContent = ''
    if (extractResponse.ok) {
      const extractData = await extractResponse.json()
      extractedContent = extractData.content
      console.log('✅ URL extraction successful')
      console.log('Content length:', extractedContent.length)
      console.log('Content preview (first 300 chars):')
      console.log(extractedContent.substring(0, 300))
      console.log('\nContent preview (last 300 chars):')
      console.log(extractedContent.substring(extractedContent.length - 300))
      
      // Check for specific content indicators
      const lowerContent = extractedContent.toLowerCase()
      console.log('\n--- Content Analysis ---')
      console.log('Contains "johns creek":', lowerContent.includes('johns creek'))
      console.log('Contains "architectural digest":', lowerContent.includes('architectural digest'))
      console.log('Contains "georgia":', lowerContent.includes('georgia'))
      console.log('Contains "atlanta":', lowerContent.includes('atlanta'))
      console.log('Contains specific numbers/rankings:', /\d+/.test(extractedContent))
      
    } else {
      console.log('❌ URL extraction failed')
      const errorData = await extractResponse.json()
      console.log('Error:', errorData)
      return
    }

    // Step 2: Test the full script generation pipeline
    console.log('\n--- STEP 2: FULL SCRIPT GENERATION PIPELINE ---')
    const scriptResponse = await fetch('https://introfuse.vercel.app/api/generate-scripts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentSource: testUrl,
        contentType: 'url',
        artist: artist,
        songTitle: title,
        selectedStyle: 'Casual',
      }),
    })

    if (scriptResponse.ok) {
      const scriptData = await scriptResponse.json()
      console.log('✅ Script generation successful')
      
      console.log('\n--- DETAILED RESULTS ---')
      console.log('Content Summary:', JSON.stringify(scriptData.contentSummary, null, 2))
      console.log('\nShort Script:', JSON.stringify(scriptData.shortScript, null, 2))
      console.log('\nLong Script:', JSON.stringify(scriptData.longScript, null, 2))
      
      // Analyze what we got
      console.log('\n--- SCRIPT ANALYSIS ---')
      const combinedScripts = `${scriptData.shortScript} ${scriptData.longScript} ${scriptData.contentSummary}`.toLowerCase()
      
      console.log('Scripts mention specific details:')
      console.log('- Johns Creek:', combinedScripts.includes('johns creek'))
      console.log('- Architectural Digest:', combinedScripts.includes('architectural digest'))
      console.log('- Georgia:', combinedScripts.includes('georgia'))
      console.log('- Atlanta:', combinedScripts.includes('atlanta'))
      console.log('- Specific numbers:', /\d+/.test(combinedScripts))
      
      console.log('\nProblem indicators:')
      console.log('- References "2025" as future:', combinedScripts.includes('2025') && (combinedScripts.includes('future') || combinedScripts.includes('peek')))
      console.log('- References "refreshing browser":', combinedScripts.includes('refresh'))
      console.log('- References "no content":', combinedScripts.includes('no content'))
      console.log('- Generic language:', combinedScripts.includes('trying to') || combinedScripts.includes('waiting for'))
      
    } else {
      console.log('❌ Script generation failed')
      const errorData = await scriptResponse.json()
      console.log('Error:', errorData)
    }

    // Step 3: Check deployment timestamp
    console.log('\n--- STEP 3: DEPLOYMENT CHECK ---')
    const debugResponse = await fetch('https://introfuse.vercel.app/api/debug-env')
    if (debugResponse.ok) {
      const debugData = await debugResponse.json()
      console.log('Current deployment timestamp:', debugData.timestamp)
      console.log('Environment:', debugData.environment)
    }
    
  } catch (error) {
    console.error('Deep debug failed:', error.message)
  }
}

deepDebugPipeline()