import { runScenario } from './rulesApi';
import { ApiEnvironment } from '@/contexts/EnvironmentContext';
import { Scenario } from '@/lib/types/scenario';

// Mock the global fetch function
global.fetch = jest.fn();

const mockScenarioData: Scenario = {
  id: 'scenario-1',
  name: 'Test Scenario',
  scenario_data: { key: 'value' },
  author: 'user-1',
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
};

describe('rulesApi - runScenario', () => {
  // Store original env variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Clear mock history before each test
    (fetch as jest.Mock).mockClear();
    // Restore original env variables
    process.env = { ...originalEnv }; 
    // Set mock env variables for tests
    process.env.NEXT_PUBLIC_UAT_API_URL = 'http://uat.example.com';
    process.env.NEXT_PUBLIC_UAT_API_KEY = 'uat-key';
    process.env.NEXT_PUBLIC_MVP_API_URL = 'http://mvp.example.com';
    process.env.NEXT_PUBLIC_MVP_API_KEY = 'mvp-key';
  });

  afterAll(() => {
    // Restore original env variables after all tests
    process.env = originalEnv;
  });

  it('should call the UAT endpoint with the correct headers and body', async () => {
    const environment: ApiEnvironment = 'UAT';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await runScenario(mockScenarioData, environment);

    expect(fetch).toHaveBeenCalledWith(
      'http://uat.example.com/resolve-with-rules-and-journal',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'uat-key',
        },
        body: JSON.stringify({
          data: mockScenarioData,
          resolveWithJournal: true,
        }),
      },
    );
  });

  it('should call the MVP endpoint with the correct headers and body', async () => {
    const environment: ApiEnvironment = 'MVP';
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    await runScenario(mockScenarioData, environment);

    expect(fetch).toHaveBeenCalledWith(
      'http://mvp.example.com/resolve-with-rules-and-journal',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'mvp-key',
        },
        body: JSON.stringify({
          data: mockScenarioData,
          resolveWithJournal: true,
        }),
      },
    );
  });

  it('should return the json response on success', async () => {
    const mockResponse = { data: 'some result' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await runScenario(mockScenarioData, 'UAT');
    expect(result).toEqual(mockResponse);
  });

  it('should throw an error if the fetch call fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    await expect(runScenario(mockScenarioData, 'UAT')).rejects.toThrow(
      'API call failed with status 500: Internal Server Error',
    );
  });
  
  it('should throw an error if NEXT_PUBLIC_UAT_API_URL is not set for UAT environment', async () => {
    delete process.env.NEXT_PUBLIC_UAT_API_URL;
    await expect(runScenario(mockScenarioData, 'UAT')).rejects.toThrow(
      'UAT API URL or Key is not configured.',
    );
  });

  it('should throw an error if NEXT_PUBLIC_UAT_API_KEY is not set for UAT environment', async () => {
    delete process.env.NEXT_PUBLIC_UAT_API_KEY;
    await expect(runScenario(mockScenarioData, 'UAT')).rejects.toThrow(
      'UAT API URL or Key is not configured.',
    );
  });

  it('should throw an error if NEXT_PUBLIC_MVP_API_URL is not set for MVP environment', async () => {
    delete process.env.NEXT_PUBLIC_MVP_API_URL;
    await expect(runScenario(mockScenarioData, 'MVP')).rejects.toThrow(
      'MVP API URL or Key is not configured.',
    );
  });

  it('should throw an error if NEXT_PUBLIC_MVP_API_KEY is not set for MVP environment', async () => {
    delete process.env.NEXT_PUBLIC_MVP_API_KEY;
    await expect(runScenario(mockScenarioData, 'MVP')).rejects.toThrow(
      'MVP API URL or Key is not configured.',
    );
  });
}); 