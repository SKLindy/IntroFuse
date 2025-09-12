// Test URL content extraction
async function testUrlExtraction() {
  try {
    // Test with production deployment
    const testUrl = "https://www.wsbtv.com/news/local/atlanta/gov-brian-kemp-swears-his-own-daughter-state-trooper/ZEVU4JXQK5EKRG4ZEDP4KVD3DM/" // Georgia governor story
    
    console.log('Testing URL extraction with:', testUrl)
    
    const response = await fetch('https://introfuse.vercel.app/api/extract-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: testUrl }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('URL extraction error:', errorData)
      return
    }

    const data = await response.json()
    console.log('Extracted content length:', data.content.length)
    console.log('First 500 characters:', data.content.substring(0, 500))
    console.log('Content appears meaningful:', data.content.length > 100 && !data.content.includes('Access Denied'))
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testUrlExtraction()