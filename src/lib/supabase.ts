import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Validate environment variables in production
if (process.env.NODE_ENV === 'production' && supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL in production environment')
}
if (process.env.NODE_ENV === 'production' && supabaseAnonKey === 'placeholder-key') {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in production environment')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function createServerSupabaseClient() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server component
          }
        },
      },
    }
  )
}