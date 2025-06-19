'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getScenarioById } from '@/lib/supabase/scenarios';
import ScenarioEditor from '@/components/scenarios/ScenarioEditor';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Scenario } from '@/lib/types/scenario';

export default function EditScenarioPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for authentication to resolve
    }
    if (!user) {
      // This case should ideally be handled by route protection,
      // but as a fallback, we prevent fetching.
      setLoading(false);
      return;
    }

    const fetchScenario = async () => {
      try {
        setLoading(true);
        const fetchedScenario = await getScenarioById(id);
        if (!fetchedScenario) {
          setError('Scenario not found.');
          notFound();
        } else {
          setScenario(fetchedScenario);
        }
      } catch (e) {
        if (e instanceof Error) {
            setError(`Failed to fetch scenario: ${e.message}`);
        } else {
            setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchScenario();
  }, [id, user, authLoading]);

  if (loading || authLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (!scenario) {
    // This can happen if the user is not authenticated or scenario not found
    return <div>Scenario could not be loaded.</div>
  }

  return (
    <div>
      <Link href="/protected-routes/test-scenarios" passHref>
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Scenario List
        </Button>
      </Link>
      <a
        href={`/protected-routes/scenarios/${id}/run`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button className="ml-2 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
          </svg>
          Run Scenario
        </Button>
      </a>
      <h1 className="text-2xl font-bold mb-4">Edit Scenario</h1>
      <ScenarioEditor scenario={scenario} />
    </div>
  );
};