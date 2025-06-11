import { ApiEnvironment } from '@/contexts/EnvironmentContext';
import { Scenario } from '@/lib/types/scenario';

// This represents the structure of the API response, where each key
// is a lender and the value is a dictionary of rule results.
export type RulesApiResponse = Record<string, Record<string, any>>;

export const runScenario = async (
  scenario: Scenario,
  environment: ApiEnvironment,
): Promise<RulesApiResponse> => {
  const isUat = environment === 'UAT';

  const apiUrl = isUat
    ? process.env.NEXT_PUBLIC_UAT_API_URL
    : process.env.NEXT_PUBLIC_MVP_API_URL;
  const apiKey = isUat
    ? process.env.NEXT_PUBLIC_UAT_API_KEY
    : process.env.NEXT_PUBLIC_MVP_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      `${environment} API URL or Key is not configured.`,
    );
  }

  const endpoint = `${apiUrl}/resolve-with-rules-and-journal`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      data: scenario,
      resolveWithJournal: true,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `API call failed with status ${response.status}: ${response.statusText}`,
    );
  }

  return response.json();
}; 