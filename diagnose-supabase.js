// Quick Supabase configuration diagnosis
import { readFileSync } from 'fs'

function diagnoseSupabase() {
  console.log('=== SUPABASE CONFIGURATION DIAGNOSIS ===\n')

  try {
    const envContent = readFileSync('.env.local', 'utf8')
    console.log('📁 Environment file contents:')
    console.log(envContent)
    console.log()

    // Check for placeholder values
    const lines = envContent.split('\n')
    let hasPlaceholders = false

    lines.forEach(line => {
      if (line.includes('your_actual_') || line.includes('your_') || line.includes('placeholder')) {
        console.log(`❌ PLACEHOLDER DETECTED: ${line}`)
        hasPlaceholders = true
      }
    })

    if (hasPlaceholders) {
      console.log('\n🚨 PROBLEM FOUND: Supabase keys are placeholder values!')
      console.log('\n📋 TO FIX THIS:')
      console.log('1. Go to your Supabase project dashboard: https://supabase.com/dashboard')
      console.log('2. Navigate to Settings > API')
      console.log('3. Copy your Project URL and anon/public key')
      console.log('4. Update your .env.local file with real values')
      console.log('5. For the service role key, copy the service_role secret (be careful with this one!)')
    } else {
      console.log('✅ No placeholder values detected in environment file')
    }

    // Check Supabase URL format
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)
    if (urlMatch) {
      const url = urlMatch[1].trim()
      if (url.includes('supabase.co') && url.startsWith('https://')) {
        console.log('✅ Supabase URL format looks correct')
      } else {
        console.log('❌ Supabase URL format looks incorrect')
      }
    }

  } catch (error) {
    console.log('❌ Could not read .env.local file:', error.message)
  }

  console.log('\n=== DIAGNOSIS COMPLETE ===')
  console.log('\nOnce you update the keys, try accessing: https://introfuse.vercel.app')
  console.log('(without the ?bypass=true parameter)')
}

diagnoseSupabase()