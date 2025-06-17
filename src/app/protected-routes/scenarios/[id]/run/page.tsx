'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getScenarioById } from '@/lib/supabase/scenarios';
import { runScenario, ScenarioResult } from '@/lib/services/rulesApi'; // Updated import
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { Scenario } from '@/lib/types/scenario';
import { transformResultsForGrid } from '@/lib/utils/resultsTransformer';
import ResultsGrid from '@/components/results/ResultsGrid';

const ScenarioResultsPage = () => {
  const params = useParams();
  const scenarioId = params.scenario_id as string;

  const { environment } = useEnvironment();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [results, setResults] = useState(null);
  const [jobUuid, setJobUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { colDefs, rowData } = useMemo(
    () => {
      if (!results) {
        return { colDefs: [], rowData: [] };
      }
      
      const transformed = transformResultsForGrid(results);
      
      return transformed;
    },
    [results],
  );

  const copyJobUuidToClipboard = () => {
    if (jobUuid) {
      navigator.clipboard.writeText(jobUuid);
      // Optionally add some visual feedback like a toast notification
    }
  };

  useEffect(() => {
    const fetchAndRun = async () => {
      if (!scenarioId) return;

      try {
        setLoading(true);
        setError(null);
        setScenario(null);
        setResults(null);
        setJobUuid(null);

        const fetchedScenario = await getScenarioById(scenarioId);
        if (!fetchedScenario) {
          throw new Error(`Scenario with ID ${scenarioId} not found.`);
        }
        setScenario(fetchedScenario);

        if (!fetchedScenario.scenario_data) {
          throw new Error('Scenario does not contain any data to run.');
        }

        const { job_uuid, response } = await runScenario(
          fetchedScenario,
          environment,
        );
        setJobUuid(job_uuid);
        setResults(response);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndRun();
  }, [scenarioId, environment]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Running Scenario...</h1>
        <p>Please wait while the results are being fetched.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {scenario && (
        <div className="mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{scenario.name}</h1>
            {scenario.description && (
              <p className="text-lg text-muted-foreground mt-2">
                {scenario.description}
              </p>
            )}
            <div className="flex items-center space-x-2 mt-3">
              <span className="text-sm text-muted-foreground">Environment:</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                environment === 'UAT' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {environment}
              </span>
            </div>
            
            {/* Job UUID Display */}
            {jobUuid && (
              <div className="mt-3 flex items-center">
                <span className="text-sm text-muted-foreground mr-2">Job UUID:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {jobUuid}
                </code>
                <button
                  onClick={copyJobUuidToClipboard}
                  className="ml-2 p-1 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded"
                  title="Copy to clipboard"
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {results && <ResultsGrid colDefs={colDefs} rowData={rowData} />}
    </div>
  );
};

export default ScenarioResultsPage;