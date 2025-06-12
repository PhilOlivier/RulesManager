'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ScenarioTable from '@/components/scenarios/ScenarioTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';

const TestScenariosPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Scenarios</h1>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search scenarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Link href="/protected-routes/test-scenarios/create" passHref>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Scenario
            </Button>
          </Link>
        </div>
      </div>
      <ScenarioTable searchTerm={searchTerm} />
    </div>
  );
};

export default TestScenariosPage; 