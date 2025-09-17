// Test login directly with Supabase to see what's happening
import { createClient } from '@supabase/supabase-js'

async function testLogin() {
  console.log('=== TESTING LOGIN PROCESS ===\n')

  // Get the environment variables from the deployed app
  const supabaseUrl = 'https://hkthudfyvdyjmefxouzu.supabase.co'

  // We'll test with a placeholder key first to see the error
  console.log('Testing with production Supabase URL...')

  // This will help us understand what's happening during login
  const testCredentials = [
    {
      email: 'test@example.com',
      password: 'testpass123',
      note: 'Test credentials'
    }
  ]

  console.log('Testing login process simulation...')
  console.log('Supabase URL:', supabaseUrl)

  // Check if we can reach the Supabase auth endpoint
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'test-key' // This will fail but show us the error format
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    })

    console.log('Auth endpoint response status:', response.status)
    const responseText = await response.text()
    console.log('Auth endpoint response:', responseText)

  } catch (error) {
    console.log('Network error reaching auth endpoint:', error.message)
  }

  console.log('\n=== LOGIN TEST COMPLETE ===')
  console.log('\nNext steps:')
  console.log('1. Check browser console for errors during login')
  console.log('2. Verify users table exists and has proper structure')
  console.log('3. Check if AuthService.getCurrentUser() is working')
}

testLogin().catch(console.error)