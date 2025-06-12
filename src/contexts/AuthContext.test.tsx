import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock the Supabase client
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignInWithOtp = jest.fn();
const mockSignOut = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithOtp: mockSignInWithOtp,
      signOut: mockSignOut,
    },
  },
}));

// Test component that uses the useAuth hook
const TestComponent = () => {
  const { user, session, loading, signInWithEmail, signOut } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="user">{user?.email || 'null'}</div>
      <div data-testid="session">{session ? 'has-session' : 'no-session'}</div>
      <button onClick={() => signInWithEmail('test@example.com')}>
        Sign In
      </button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  const mockUser = {
    id: 'test-id',
    email: 'test@example.com',
  };

  const mockSession = {
    user: mockUser,
    access_token: 'test-token',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    console.log = jest.fn();
    
    // Default mock implementations
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('AuthProvider', () => {
    it('should initialize with loading state and no user', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Initially should be loading
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('session')).toHaveTextContent('no-session');
    });

    it('should initialize with existing session', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('session')).toHaveTextContent('has-session');
    });

    it('should handle signInWithEmail', async () => {
      mockSignInWithOtp.mockResolvedValue({
        data: {},
        error: null,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const signInButton = screen.getByText('Sign In');
      
      await act(async () => {
        signInButton.click();
      });

      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    });

    it('should handle signOut', async () => {
      mockSignOut.mockResolvedValue({
        error: null,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const signOutButton = screen.getByText('Sign Out');
      
      await act(async () => {
        signOutButton.click();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should handle session errors gracefully', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error' },
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('session')).toHaveTextContent('no-session');
    });

    it('should cleanup subscription on unmount', () => {
      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
}); 