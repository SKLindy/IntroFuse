// Test Supabase authentication directly
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testSupabaseAuth() {
  console.log('=== TESTING SUPABASE AUTHENTICATION ===\n')

  // 1. Check environment variables
  console.log('1. Checking environment configuration...')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('Supabase Anon Key:', supabaseAnonKey ? '✅ Set' : '❌ Missing')
  console.log('Supabase Service Key:', supabaseServiceKey ? '✅ Set' : '❌ Missing')

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing required Supabase configuration')
    return
  }

  // 2. Test Supabase connection
  console.log('\n2. Testing Supabase connection...')
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    if (error) {
      console.log('❌ Cannot connect to users table:', error.message)
    } else {
      console.log('✅ Connected to Supabase successfully')
      console.log('Users table exists with', data?.length || 0, 'records')
    }
  } catch (error) {
    console.log('❌ Supabase connection failed:', error.message)
  }

  // 3. Test user registration
  console.log('\n3. Testing user registration...')
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'testpass123'
  const testUsername = 'TestUser'

  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: testUsername
        }
      }
    })

    if (signUpError) {
      console.log('❌ Sign up failed:', signUpError.message)
    } else {
      console.log('✅ Sign up successful')
      console.log('User ID:', signUpData.user?.id)
      console.log('Email confirmed:', !!signUpData.user?.email_confirmed_at)
      console.log('Confirmation required:', !signUpData.user?.email_confirmed_at)
    }
  } catch (error) {
    console.log('❌ Sign up error:', error.message)
  }

  // 4. Test with existing credentials (if provided)
  console.log('\n4. Testing with existing credentials...')
  console.log('Enter your existing credentials to test:')

  // For testing, try common test credentials
  const existingTestCreds = [
    { email: 'test@test.com', password: 'test123' },
    { email: 'admin@test.com', password: 'admin123' },
    { email: 'user@test.com', password: 'password' }
  ]

  for (const cred of existingTestCreds) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cred.email,
        password: cred.password
      })

      if (error) {
        console.log(`❌ Login failed for ${cred.email}:`, error.message)
      } else {
        console.log(`✅ Login successful for ${cred.email}`)
        console.log('User ID:', data.user?.id)

        // Sign out after test
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.log(`❌ Login error for ${cred.email}:`, error.message)
    }
  }

  // 5. Check database schema
  console.log('\n5. Checking database schema...')
  if (supabaseServiceKey) {
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)

    try {
      // Check if users table exists and get schema
      const { data: tableInfo, error: tableError } = await adminSupabase
        .from('information_schema.tables')
        .select('*')
        .eq('table_name', 'users')

      if (tableError) {
        console.log('❌ Could not check table schema:', tableError.message)
      } else if (tableInfo && tableInfo.length > 0) {
        console.log('✅ Users table exists')

        // Get column info
        const { data: columns, error: columnError } = await adminSupabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', 'users')

        if (!columnError && columns) {
          console.log('Table columns:')
          columns.forEach(col => {
            console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`)
          })
        }
      } else {
        console.log('❌ Users table does not exist')
      }
    } catch (error) {
      console.log('❌ Schema check error:', error.message)
    }
  }

  console.log('\n=== SUPABASE AUTHENTICATION TEST COMPLETE ===')
}

testSupabaseAuth().catch(console.error)