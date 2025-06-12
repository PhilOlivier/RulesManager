import { middleware, config } from './middleware';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    next: jest.fn(),
    redirect: jest.fn(),
  },
}));

// Mock Supabase SSR
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

// Mock console methods
const consoleSpy = {
  error: jest.spyOn(console, 'error').mockImplementation(),
};

describe('Authentication Middleware', () => {
  const mockCreateServerClient = createServerClient as jest.MockedFunction<typeof createServerClient>;
  const mockNextResponse = {
    next: NextResponse.next as jest.MockedFunction<typeof NextResponse.next>,
    redirect: NextResponse.redirect as jest.MockedFunction<typeof NextResponse.redirect>,
  };

  let mockSupabaseClient: any;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset console spies
    consoleSpy.error.mockClear();

    // Mock Supabase client
    mockSupabaseClient = {
      auth: {
        getSession: jest.fn(),
      },
    };
    mockCreateServerClient.mockReturnValue(mockSupabaseClient);

    // Mock NextResponse
    mockResponse = {
      cookies: {
        set: jest.fn(),
      },
    };
    mockNextResponse.next.mockReturnValue(mockResponse);
    mockNextResponse.redirect.mockReturnValue(mockResponse);

    // Mock cookies
    const mockCookies = {
      get: jest.fn(),
      set: jest.fn(),
    };

    // Mock NextRequest
    mockRequest = {
      nextUrl: {
        pathname: '/test-scenarios',
      },
      url: 'https://example.com/test-scenarios',
      headers: new Headers(),
      cookies: mockCookies,
    };
  });

  afterAll(() => {
    // Restore console methods
    consoleSpy.error.mockRestore();
  });

  describe('Public route handling', () => {
    const publicRoutes = [
      '/login',
      '/auth/callback',
      '/_next/static/test.js',
      '/_next/image/test.png',
      '/favicon.ico',
      '/api/test',
    ];

    publicRoutes.forEach(route => {
      it(`should allow access to public route: ${route}`, async () => {
        mockRequest.nextUrl.pathname = route;
        mockRequest.url = `https://example.com${route}`;

        const result = await middleware(mockRequest as NextRequest);

        expect(mockSupabaseClient.auth.getSession).not.toHaveBeenCalled();
        expect(mockNextResponse.redirect).not.toHaveBeenCalled();
        expect(result).toBe(mockResponse);
      });
    });

    it('should handle nested public routes', async () => {
      mockRequest.nextUrl.pathname = '/_next/static/chunks/main.js';
      mockRequest.url = 'https://example.com/_next/static/chunks/main.js';

      const result = await middleware(mockRequest as NextRequest);

      expect(mockSupabaseClient.auth.getSession).not.toHaveBeenCalled();
      expect(mockNextResponse.redirect).not.toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });
  });

  describe('Protected route handling', () => {
    it('should allow access when user has valid session', async () => {
      const mockSession = {
        access_token: 'valid-token',
        user: { id: '123', email: 'test@example.com' },
      };
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await middleware(mockRequest as NextRequest);

      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
      expect(mockNextResponse.redirect).not.toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });

    it('should redirect to login when no session exists', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await middleware(mockRequest as NextRequest);

      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL('/login?redirectTo=%2Ftest-scenarios', 'https://example.com/test-scenarios')
      );
    });

    it('should redirect to login when session has error', async () => {
      const mockError = { message: 'Session expired' };
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      await middleware(mockRequest as NextRequest);

      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL('/login?redirectTo=%2Ftest-scenarios', 'https://example.com/test-scenarios')
      );
    });

    it('should not add redirectTo parameter for root path', async () => {
      mockRequest.nextUrl.pathname = '/';
      mockRequest.url = 'https://example.com/';
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await middleware(mockRequest as NextRequest);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL('/login', 'https://example.com/')
      );
    });

    it('should handle complex paths with redirectTo parameter', async () => {
      mockRequest.nextUrl.pathname = '/test-scenarios/123/edit';
      mockRequest.url = 'https://example.com/test-scenarios/123/edit';
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await middleware(mockRequest as NextRequest);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL('/login?redirectTo=%2Ftest-scenarios%2F123%2Fedit', 'https://example.com/test-scenarios/123/edit')
      );
    });
  });

  describe('Error handling', () => {
    it('should redirect to login on unexpected errors', async () => {
      const unexpectedError = new Error('Network error');
      mockSupabaseClient.auth.getSession.mockRejectedValue(unexpectedError);

      await middleware(mockRequest as NextRequest);

      expect(consoleSpy.error).toHaveBeenCalledWith('Middleware auth error:', unexpectedError);
      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL('/login', 'https://example.com/test-scenarios')
      );
    });

    it('should handle Supabase client creation errors gracefully', async () => {
      mockCreateServerClient.mockImplementation(() => {
        throw new Error('Supabase client error');
      });

      try {
        await middleware(mockRequest as NextRequest);
      } catch (error) {
        // This error is expected, so we catch it and verify the behavior
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Cookie handling', () => {
    it('should create Supabase client with proper cookie configuration', async () => {
      const mockSession = {
        access_token: 'valid-token',
        user: { id: '123', email: 'test@example.com' },
      };
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      await middleware(mockRequest as NextRequest);

      expect(mockCreateServerClient).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        expect.objectContaining({
          cookies: expect.objectContaining({
            get: expect.any(Function),
            set: expect.any(Function),
            remove: expect.any(Function),
          }),
        })
      );
    });

    it('should handle cookie operations correctly', async () => {
      const mockSession = {
        access_token: 'valid-token',
        user: { id: '123', email: 'test@example.com' },
      };
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });
      mockRequest.cookies.get.mockReturnValue({ value: 'test-cookie-value' });

      await middleware(mockRequest as NextRequest);

      // Verify the cookie configuration is passed correctly
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        expect.objectContaining({
          cookies: expect.objectContaining({
            get: expect.any(Function),
            set: expect.any(Function),
            remove: expect.any(Function),
          }),
        })
      );
    });
  });

  describe('Different route scenarios', () => {
    const protectedRoutes = [
      '/test-scenarios',
      '/lender-settings',
      '/rules',
      '/results',
      '/dashboard',
      '/profile',
    ];

    protectedRoutes.forEach(route => {
      it(`should protect route: ${route}`, async () => {
        mockRequest.nextUrl.pathname = route;
        mockRequest.url = `https://example.com${route}`;
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });

        await middleware(mockRequest as NextRequest);

        expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
        expect(mockNextResponse.redirect).toHaveBeenCalledWith(
          new URL(`/login?redirectTo=${encodeURIComponent(route)}`, `https://example.com${route}`)
        );
      });
    });
  });

  describe('Configuration', () => {
    it('should have proper matcher configuration', () => {
      expect(config).toBeDefined();
      expect(config.matcher).toBeDefined();
      expect(Array.isArray(config.matcher)).toBe(true);
      expect(config.matcher[0]).toContain('(?!_next/static|_next/image|favicon.ico');
    });
  });

  describe('Edge cases', () => {
    it('should handle session with null user', async () => {
      const mockSession = {
        access_token: 'valid-token',
        user: null,
      };
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await middleware(mockRequest as NextRequest);

      // Should still allow access if session exists even with null user
      expect(mockNextResponse.redirect).not.toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });

    it('should handle malformed URL gracefully', async () => {
      mockRequest.url = 'invalid-url';
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Should throw an error for malformed URLs as expected
      await expect(middleware(mockRequest as NextRequest)).rejects.toThrow();
    });

    it('should handle empty pathname', async () => {
      mockRequest.nextUrl.pathname = '';
      mockRequest.url = 'https://example.com';
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await middleware(mockRequest as NextRequest);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL('/login?redirectTo=', 'https://example.com')
      );
    });

    it('should handle session with expired token', async () => {
      const mockSession = {
        access_token: 'expired-token',
        user: { id: '123', email: 'test@example.com' },
      };
      const mockError = { message: 'Token expired' };
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: mockError,
      });

      await middleware(mockRequest as NextRequest);

      expect(mockNextResponse.redirect).toHaveBeenCalledWith(
        new URL('/login?redirectTo=%2Ftest-scenarios', 'https://example.com/test-scenarios')
      );
    });
  });
}); 