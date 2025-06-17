'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayCircle, Save } from 'lucide-react';

interface ScenarioActionsProps {
  scenarioId: string;
}

export default function ScenarioActions({ scenarioId }: ScenarioActionsProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Link href="/protected-routes/test-scenarios" passHref>
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Scenario List
        </Button>
      </Link>

      <Button 
        variant="outline"
        onClick={() => {
            console.log("Save button clicked, dispatching save-scenario event");
            document.dispatchEvent(new CustomEvent('save-scenario'));
        // Add visual feedback
        alert("Save triggered"); // Temporary to check if the button works
        }}
        >
            <Save className="mr-2 h-4 w-4" />
            Save Changes
        </Button>
      
      <Link 
        href={`/protected-routes/scenarios/${scenarioId}/run`} 
        target="_blank" 
        rel="noopener noreferrer"
        passHref
      >
        <Button variant="default">
          <PlayCircle className="mr-2 h-4 w-4" />
          Run Scenario
        </Button>
      </Link>
    </div>
  );
}