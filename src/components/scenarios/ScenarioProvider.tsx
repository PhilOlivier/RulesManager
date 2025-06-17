'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getScenarioById } from '@/lib/supabase/scenarios';
import { Scenario } from '@/lib/types/scenario';

interface ScenarioContextType {
  scenario: Scenario | null;
  loading: boolean;
  error: Error | null;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider = ({
  scenarioId,
  children,
}: {
  scenarioId: string;
  children: ReactNode;
}) => {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!scenarioId) {
        setLoading(false);
        return
    };

    const fetchScenario = async () => {
      try {
        setLoading(true);
        const fetchedScenario = await getScenarioById(scenarioId);
        setScenario(fetchedScenario);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchScenario();
  }, [scenarioId]);

  return (
    <ScenarioContext.Provider value={{ scenario, loading, error }}>
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = () => {
  const context = useContext(ScenarioContext);
  if (context === undefined) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
}; 