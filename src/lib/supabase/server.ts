import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Ensure we're setting cookies with the right options
            cookieStore.set({ 
              name, 
              value, 
              ...options,
              // Make sure cookies work across your entire site
              path: '/',
              // Ensure secure settings
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            })
          } catch (error) {
            console.error('Error setting cookie:', error)
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ 
              name, 
              value: '', 
              ...options,
              // Make sure cookies are removed across your entire site  
              path: '/',
              maxAge: 0 
            })
          } catch (error) {
            console.error('Error removing cookie:', error)
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}