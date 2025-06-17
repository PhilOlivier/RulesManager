'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import LoginForm from '@/components/auth/LoginForm';
import QDEXLogo from '@/assets/QDEX-logo-purple.svg';
import { useSearchParams } from 'next/navigation';

// Create a component for the login content that uses useSearchParams
function LoginContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('error');

  // Create a message based on the error type
  let errorMessage = '';
  if (errorType === 'session_error') {
    errorMessage = 'There was a problem with your session. Please log in again.';
  } else if (errorType === 'no_session') {
    errorMessage = 'Your session could not be found. Please log in again.';
  } else if (errorType === 'no_user') {
    errorMessage = 'User information not found in your session. Please log in again.';
  } else if (errorType === 'unexpected') {
    errorMessage = 'An unexpected error occurred. Please try again.';
  } else if (errorType === 'auth_failed') {
    errorMessage = 'Authentication failed. Please check your credentials and try again.';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image src={QDEXLogo} alt="QDEX Logo" width={32} height={32} />
            <span className="font-bold text-xl">
              Rules Builder
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
              Welcome
          </h1>
          <p className="text-sm text-muted-foreground">
              Enter your email address to log in
          </p>
        </div>
        
        {/* Display error message if present */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {errorMessage}
          </div>
        )}
        
        <LoginForm />
        
        {/* Add link to alternative login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Having trouble with magic links?{' '}
            <a href="/direct-access/temp-login" className="text-blue-600 hover:underline">
              Try password login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
const LoginPage = () => {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
};

export default LoginPage;