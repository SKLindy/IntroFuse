// Test the full pipeline with the Georgia governor story
async function testFullPipeline() {
  try {
    const testUrl = "https://www.wsbtv.com/news/local/atlanta/gov-brian-kemp-swears-his-own-daughter-state-trooper/ZEVU4JXQK5EKRG4ZEDP4KVD3DM/"
    
    console.log('Testing full pipeline with Georgia governor story...')
    
    const response = await fetch('https://introfuse.vercel.app/api/generate-scripts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentSource: testUrl,
        contentType: 'url',
        artist: 'Taylor Swift',
        songTitle: 'Love Story',
        selectedStyle: 'Casual',
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Full pipeline error:', errorData)
      return
    }

    const data = await response.json()
    console.log('Full pipeline response:')
    console.log('Short Script:', data.shortScript)
    console.log('Long Script:', data.longScript)
    console.log('Content Summary:', data.contentSummary)
    
    // Check if content references the story
    const shortScript = data.shortScript || ''
    const longScript = data.longScript || ''
    const summary = data.contentSummary || ''
    
    console.log('\n--- CONTENT ANALYSIS ---')
    console.log('Summary mentions Kemp:', summary.toLowerCase().includes('kemp'))
    console.log('Summary mentions daughter:', summary.toLowerCase().includes('daughter'))
    console.log('Summary mentions trooper:', summary.toLowerCase().includes('trooper'))
    
    console.log('\n--- SCRIPT ANALYSIS ---')
    console.log('Scripts mention Kemp:', shortScript.toLowerCase().includes('kemp') || longScript.toLowerCase().includes('kemp'))
    console.log('Scripts mention daughter:', shortScript.toLowerCase().includes('daughter') || longScript.toLowerCase().includes('daughter'))
    console.log('Scripts mention trooper/patrol:', shortScript.toLowerCase().includes('trooper') || shortScript.toLowerCase().includes('patrol') || longScript.toLowerCase().includes('trooper') || longScript.toLowerCase().includes('patrol'))
    console.log('Scripts mention Georgia:', shortScript.toLowerCase().includes('georgia') || longScript.toLowerCase().includes('georgia'))
    
    if (shortScript.toLowerCase().includes('blank') || shortScript.toLowerCase().includes('empty') || longScript.toLowerCase().includes('blank') || longScript.toLowerCase().includes('empty')) {
      console.log('⚠️  GENERIC/FALLBACK SCRIPTS DETECTED')
    } else if (shortScript.toLowerCase().includes('kemp') || longScript.toLowerCase().includes('kemp') || shortScript.toLowerCase().includes('trooper') || longScript.toLowerCase().includes('trooper')) {
      console.log('✅ Scripts appear to use actual content')
    } else {
      console.log('🤔 Scripts may not be using the specific content')
    }

  } catch (error) {
    console.error('Test failed:', error)
  }
}

testFullPipeline()