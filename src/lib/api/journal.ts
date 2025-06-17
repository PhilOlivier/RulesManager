// This file will contain the service for fetching journal data. 

import { ApiEnvironment } from '@/contexts/EnvironmentContext';

export interface JournalEntry {
  // Define the structure of a journal entry based on the expected API response
  // This is a placeholder and should be updated with the actual structure.
  id: string;
  comment: 'Unresolved' | 'Resolved';
  dictionary: {
    [key: string]: string;
  };
  QDEXBankCode: string;
  // ... other properties
}

export const getJournalByJobId = async (
  jobId: string,
  environment: ApiEnvironment
): Promise<JournalEntry[]> => {
  const isUat = environment === 'UAT';
  const apiUrl = isUat
    ? process.env.NEXT_PUBLIC_UAT_API_URL
    : process.env.NEXT_PUBLIC_MVP_API_URL;
  
  const apiKey = isUat
    ? process.env.NEXT_PUBLIC_UAT_API_KEY
    : process.env.NEXT_PUBLIC_MVP_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(`${environment} API URL or Key is not configured.`);
  }

  const endpoint = `${apiUrl.replace(/\/$/, '')}/get_journal/${jobId}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    let detail = await response.text();
    try {
      const errorJson = JSON.parse(detail);
      detail = errorJson.detail || detail;
    } catch (e) {
      // Not a JSON response, use the text body as is
    }
    throw new Error(
      `Failed to fetch journal data: ${response.status} ${response.statusText} - ${detail}`
    );
  }

  const responseData = await response.json();

  // The API returns an unusual object: {"": [...]}. We need to extract the array from the empty string key.
  if (responseData && typeof responseData === 'object' && !Array.isArray(responseData) && Array.isArray(responseData[''])) {
    return responseData[''];
  }

  // If the structure is still not what we expect, throw an informative error.
  console.error("Unexpected journal API response structure:", responseData);
  throw new Error(
    "Journal data received from API is not in the expected format. Expected an object with an empty string key containing an array."
  );
}; 