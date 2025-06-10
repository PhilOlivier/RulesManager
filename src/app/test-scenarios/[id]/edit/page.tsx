import React from 'react';
import { notFound } from 'next/navigation';
import { getScenarioById } from '@/lib/supabase/scenarios';
import ScenarioEditor from '@/components/scenarios/ScenarioEditor';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface EditScenarioPageProps {
  params: {
    id: string;
  };
}

const EditScenarioPage = async ({ params }: EditScenarioPageProps) => {
  const scenario = await getScenarioById(params.id);

  if (!scenario) {
    notFound();
  }

  return (
    <div>
      <Link href="/test-scenarios" passHref>
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Scenario List
        </Button>
      </Link>
      <h1 className="text-2xl font-bold mb-4">Edit Scenario</h1>
      <ScenarioEditor scenario={scenario} />
    </div>
  );
};

export default EditScenarioPage; 