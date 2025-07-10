import { ApiEnvironment } from '@/contexts/EnvironmentContext';
import { Scenario } from '@/lib/types/scenario';
import { v4 as uuidv4 } from 'uuid';

// This represents the structure of the API response, where each key
// is a lender and the value is a dictionary of rule results.
export type RulesApiResponse = Record<string, any>;

// Define a new return type that includes the job_uuid
export type ScenarioResult = {
  job_uuid: string;
  response: RulesApiResponse;
};

export const runScenario = async (
  scenario: Scenario,
  environment: ApiEnvironment,
): Promise<ScenarioResult> => {
  const isUat = environment === 'UAT';

  const apiUrl = isUat
    ? process.env.NEXT_PUBLIC_UAT_API_URL
    : process.env.NEXT_PUBLIC_PROD_API_URL;
  const apiKey = isUat
    ? process.env.NEXT_PUBLIC_UAT_API_KEY
    : process.env.NEXT_PUBLIC_PROD_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      `${environment} API URL or Key is not configured.`,
    );
  }

  const endpoint = `${apiUrl.replace(/\/$/, '')}/resolve-with-rules-and-journal`;

  const jobUuid = uuidv4();
  
  const requestPayload = {
    job_uuid: jobUuid,
    bank_uuid: '',
    inbound: scenario.scenario_data,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    throw new Error(
      `API call failed with status ${response.status}: ${response.statusText}`,
    );
  }

  const responseData = await response.json();

  return {
    job_uuid: jobUuid,
    response: responseData,
  };
};