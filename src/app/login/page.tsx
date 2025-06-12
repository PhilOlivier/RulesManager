'use client';

import React from 'react';
import Image from 'next/image';
import LoginForm from '@/components/auth/LoginForm';
import QDEXLogo from '@/assets/QDEX logo purple.svg';

const LoginPage = () => {
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
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage; 