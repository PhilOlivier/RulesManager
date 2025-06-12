import { createClient } from '@supabase/supabase-js';

// Mock the createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock environment variables
const mockEnv = (url?: string, key?: string) => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = url;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = key;
};

describe('Supabase Client', () => {
  const originalEnv = process.env;
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should create Supabase client with correct configuration', async () => {
    // Arrange
    const testUrl = 'https://test-project.supabase.co';
    const testKey = 'test-anon-key';
    mockEnv(testUrl, testKey);
    mockCreateClient.mockReturnValue({} as any);

    // Act
    const { supabase } = await import('./supabaseClient');

    // Assert
    expect(mockCreateClient).toHaveBeenCalledWith(testUrl, testKey);
    expect(supabase).toBeDefined();
  });

  it('should throw error when NEXT_PUBLIC_SUPABASE_URL is missing', async () => {
    // Arrange
    mockEnv(undefined, 'test-key');

    // Act & Assert
    await expect(() => import('./supabaseClient')).rejects.toThrow(
      'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL'
    );
  });

  it('should throw error when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', async () => {
    // Arrange
    mockEnv('https://test-project.supabase.co', undefined);

    // Act & Assert
    await expect(() => import('./supabaseClient')).rejects.toThrow(
      'Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  });

  it('should throw error when both environment variables are missing', async () => {
    // Arrange
    mockEnv(undefined, undefined);

    // Act & Assert
    await expect(() => import('./supabaseClient')).rejects.toThrow(
      'Missing environment variable: NEXT_PUBLIC_SUPABASE_URL'
    );
  });
}); 