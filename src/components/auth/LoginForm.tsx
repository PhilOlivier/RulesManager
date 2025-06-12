'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const LoginForm = () => {
  const { signInWithEmail, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const validateEmail = (email: string) => {
    // Basic email regex for client-side validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!email.trim()) {
      setMessage('Please enter an email address.');
      setIsError(true);
      return;
    }

    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address.');
      setIsError(true);
      return;
    }

    try {
      const { error } = await signInWithEmail(email);
      if (error) {
        setMessage(error.message || 'Failed to send magic link. Please try again.');
        setIsError(true);
      } else {
        setMessage('Magic link sent! Please check your email and click the link to log in.');
        setIsError(false);
        setEmail(''); // Clear the form on success
      }
    } catch (err) {
      setMessage('An unexpected error occurred. Please try again.');
      setIsError(true);
      console.error(err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Use a magic link to sign in to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} id="login-form">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="me@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            {message && (
              <div
                className={`text-sm p-3 rounded-md ${
                  isError
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-green-100 text-green-700 border border-green-200'
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <Button className="w-full" disabled={loading} type="submit" form="login-form">
          {loading ? 'Sending...' : 'Send Magic Link'}
        </Button>
        <p className="text-xs text-center text-muted-foreground w-full">
          We'll send you a secure link to log in without a password.
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm; 