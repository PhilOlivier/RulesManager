'use client';
import { ScenariosDataTable } from './scenarios-data-table';
import { columns } from './columns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusIcon } from 'lucide-react';
import { Scenario } from '@/lib/types/scenario';

// TODO: This will be replaced with client-side data fetching
const scenarios: Scenario[] = [];

export default function ScenariosPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Test Scenarios</h1>
        <Button asChild>
          <Link href="/protected-routes/scenarios/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Scenario
          </Link>
        </Button>
      </div>
      <ScenariosDataTable columns={columns} data={scenarios} />
    </div>
  );
} 