'use client';

import ScenarioEditor from '@/components/scenarios/ScenarioEditor';
import {
  ScenarioProvider,
  useScenario,
} from '../../../../../components/scenarios/ScenarioProvider';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, Play } from 'lucide-react';

function EditScenarioView() {
  const { scenario, loading, error } = useScenario();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  // Scenario can be null if not found
  if (!scenario) return <div>Scenario not found</div>;

  return <ScenarioEditor scenario={scenario} />;
}

export default function EditScenarioPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const handleRunScenario = () => {
    // A null/undefined id should be handled by the disabled state, but check just in case.
    if (!id) return;
    const url = `/protected-routes/scenarios/${id}/run`;
    window.open(url, '_blank');
  };

  return (
    <ScenarioProvider scenarioId={id}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Edit Scenario</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/protected-routes/scenarios">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Scenarios
              </Link>
            </Button>
            <Button onClick={handleRunScenario} disabled={!id}>
              <Play className="mr-2 h-4 w-4" />
              Run Scenario
            </Button>
          </div>
        </div>
        <EditScenarioView />
      </div>
    </ScenarioProvider>
  );
} 