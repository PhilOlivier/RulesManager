// app/direct-access/temp-login/page.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function DirectTempLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Login successful! Redirecting to application...');
        
        // Redirect directly to protected routes
        setTimeout(() => {
          window.location.href = '/protected-routes/test-scenarios';
        }, 1500);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-8 max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Alternative Login</h1>
      <p className="mb-4 text-gray-600">Use your email and password to log in.</p>
      
      {error && <div className="bg-red-100 p-3 mb-4 text-red-700 rounded">{error}</div>}
      {success && <div className="bg-green-100 p-3 mb-4 text-green-700 rounded">{success}</div>}
      
      {!success && (
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </div>
          
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      )}
      
      {/* Link back to magic link login */}
      <div className="mt-6 text-center">
        <a href="/login" className="text-sm text-blue-600 hover:underline">
          Prefer to use a magic link? Go back to regular login
        </a>
      </div>
    </div>
  );
}