// Debug authentication issues
async function debugAuth() {
  console.log('=== TESTING AUTHENTICATION FUNCTIONALITY ===\n')

  const baseUrl = 'https://introfuse.vercel.app'

  // Test 1: Check if bypass URL works
  console.log('1. Testing bypass URL access...')
  try {
    const bypassResponse = await fetch(`${baseUrl}?bypass=true`)
    console.log('✅ Bypass URL accessible:', bypassResponse.status)
  } catch (error) {
    console.error('❌ Bypass URL failed:', error.message)
  }

  // Test 2: Test user registration
  console.log('\n2. Testing user registration...')
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'testpassword123',
    username: 'TestUser'
  }

  try {
    const signupResponse = await fetch(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    })

    if (signupResponse.ok) {
      console.log('✅ Registration endpoint accessible')
      const signupData = await signupResponse.json()
      console.log('Registration response:', signupData)
    } else {
      console.log('❌ Registration failed with status:', signupResponse.status)
      const errorData = await signupResponse.json()
      console.log('Error:', errorData)
    }
  } catch (error) {
    console.error('❌ Registration request failed:', error.message)
  }

  // Test 3: Test login with known invalid credentials
  console.log('\n3. Testing login with invalid credentials...')
  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
    })

    console.log('Login response status:', loginResponse.status)
    const loginData = await loginResponse.json()
    console.log('Login response:', loginData)
  } catch (error) {
    console.error('❌ Login request failed:', error.message)
  }

  // Test 4: Check environment configuration
  console.log('\n4. Testing environment configuration...')
  try {
    const envResponse = await fetch(`${baseUrl}/api/debug-env`)
    if (envResponse.ok) {
      const envData = await envResponse.json()
      console.log('✅ Environment config accessible')
      console.log('Environment status:', envData)
    } else {
      console.log('❌ Environment debug endpoint not accessible')
    }
  } catch (error) {
    console.error('❌ Environment check failed:', error.message)
  }

  console.log('\n=== AUTHENTICATION DEBUG COMPLETE ===')
}

debugAuth()