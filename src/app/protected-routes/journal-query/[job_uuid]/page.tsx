'use client';

import { useParams, useSearchParams } from 'next/navigation';
import React from 'react';
import { useJournalData } from '@/lib/hooks/useJournalData';
import { JournalGrid } from '@/components/journal/JournalGrid';

type ViewType = 'rules' | 'results';

export default function JournalQueryResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const jobUuid = (Array.isArray(params.job_uuid) ? params.job_uuid[0] : params.job_uuid) || null;
  const view = searchParams.get('view');
  
  // Validate and set the viewType, defaulting to 'results'
  const viewType: ViewType = view === 'rules' ? 'rules' : 'results';

  const { rowData, columnDefs, loading, error } = useJournalData({
    jobUuid,
    viewType,
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold capitalize">
          {viewType} View
        </h1>
        <p className="text-sm text-muted-foreground">
          Showing results for Job UUID: {jobUuid}
        </p>
      </div>
      <JournalGrid rowData={rowData} columnDefs={columnDefs} />
    </div>
  );
} 