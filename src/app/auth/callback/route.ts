import { type EmailOtpType } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams, href } = new URL(request.url)
  
  console.log('================ AUTH CALLBACK TRIGGERED ================')
  console.log('Full callback URL:', href)
  console.log('All parameters:', Object.fromEntries(searchParams.entries()))
  
  // Check for both parameter formats
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  
  // Get redirect_to parameter
  let redirect_to = searchParams.get('redirect_to') ?? '/protected-routes/test-scenarios'
  console.log('Initial redirect_to value:', redirect_to)
  
  // Safer handling of redirect_to parameter
  if (redirect_to === '/' || 
      redirect_to.includes('localhost:3000') || 
      redirect_to.includes('/auth/callback')) {
    console.log('Replacing default redirect with /protected-routes/test-scenarios')
    redirect_to = '/protected-routes/test-scenarios'
  } else {
    // Check if it's a full URL or just a path
    try {
      const url = new URL(redirect_to);
      // If it's a URL and points to the root path
      if (url.pathname === '/') {
        console.log('URL points to root path, redirecting to /protected-routes/test-scenarios');
        redirect_to = '/protected-routes/test-scenarios';
      }
    } catch (e) {
      // Not a valid URL, assume it's a path and leave it as is
      console.log('redirect_to is not a valid URL, treating as path:', redirect_to);
    }
  }
  
  console.log('Final redirect_to value:', redirect_to)
  
  const supabase = await createClient()
  let authError = null
  
  // Add logging before authentication
  console.log('About to authenticate with params:', { token_hash, type, code });
  
  // First try token_hash flow
  if (token_hash && type) {
    console.log('Using verifyOtp with token_hash and type')
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })
    authError = error
  } 
  // Then try code flow
  else if (code) {
    console.log('Using exchangeCodeForSession with code')
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    authError = error
  }
  // No recognized auth parameters
  else {
    console.error('No valid authentication parameters found')
    return redirect('/login?error=missing_parameters')
  }
  
  // Enhanced logging after authentication
  if (!authError) {
    console.log('Authentication successful, redirecting to:', redirect_to);
    return redirect(redirect_to);
  } else {
    console.error('Authentication failed:', authError);
    console.error('Error details:', JSON.stringify(authError));
    return redirect('/login?error=auth_failed');
  }
}