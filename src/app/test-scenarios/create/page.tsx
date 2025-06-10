'use client';

import React from 'react';
import Link from 'next/link';
import ScenarioEditor from '@/components/scenarios/ScenarioEditor';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CreateScenarioPage = () => {
  return (
    <div>
      <Link href="/test-scenarios" passHref>
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Scenario List
        </Button>
      </Link>
      <h1 className="text-2xl font-bold mb-4">Create New Scenario</h1>
      <ScenarioEditor />
    </div>
  );
};

export default CreateScenarioPage; 